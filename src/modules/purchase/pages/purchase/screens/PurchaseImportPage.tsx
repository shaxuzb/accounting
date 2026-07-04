import { Button, Form, Spin } from "antd";
import { useFormik } from "formik";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { CheckCircle2, CircleX } from "lucide-react";
import useWindowSize from "@/shared/hooks/useWindowSize";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import type {
  ProductSelectOption,
  PurchaseDetailData,
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
} from "../types/type";
import type {
  PurchaseImportForm,
  PurchaseImportHeaderDraft,
} from "@/modules/purchase/pages/purchase/types/form";
import {
  purchaseValidationSchema,
  isCompletePurchaseLine,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportHeader from "../components/PurchaseImportHeader";
import ProductsCreateModal from "../components/ProductsCreateModal";
import PurchaseImportLinesSection from "../components/PurchaseImportLinesSection";
import PurchaseMarkingModal from "../components/PurchaseMarkingModal";
import {
  buildColumnConfig,
  getBaseColumnConfig,
  numericImportColumns,
  toSelectBoxOptions,
  type ImportColumnConfig,
} from "../utils/importColumns";
import { useCancelPurchase } from "../hooks/useCancelPurchase";
import { useConfirmPurchase } from "../hooks/useConfirmPurchase";
import { useCreatePurchase } from "../hooks/useCreatePurchase";
import { useGetDetailPurchase } from "../hooks/useGetDetailPurchase";
import { usePurchaseImportOptions } from "../hooks/usePurchaseImportOptions";
import { usePurchaseImportColumns } from "../hooks/usePurchaseImportColumns";
import { useUpdatePurchase } from "../hooks/useUpdatePurchase";
import useLocalStorage from "@/hooks/UseLocalStorage";
import {
  createEmptyPurchaseRow,
  getDefaultPurchaseImportHeader,
  getNumber,
  getProductCode,
  getProductPrice,
  getPurchaseImportTotals,
  getUnmarkedPieceTrackedRow,
  parseMarkingInput,
  toMarkingNumbers,
  toPurchaseCreatePayload,
} from "../utils/purchaseImport";

const PURCHASE_IMPORT_DRAFT_HEADER_KEY = "purchase-import:draft:header";
const PURCHASE_IMPORT_DRAFT_LINES_KEY = "purchase-import:draft:lines";
const PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY =
  "purchase-import:draft:product-with-count";
const PURCHASE_IMPORT_DRAFT_MODE_KEY = "purchase-import:draft:mode";

const buildTouched = (values: PurchaseImportForm) => ({
  docDate: Boolean(values.docDate),
  counterpartyId: values.counterpartyId !== null,
  contractId: values.contractId !== null,
  currencyId: values.currencyId !== null,
  warehouseId: values.warehouseId !== null,
  comment: Boolean(values.comment),
});

const mapDetailLinesToRows = (
  detail: PurchaseDetailData | undefined,
  products: ProductSelectOption[],
): PurchaseImportRow[] => {
  if (!detail) return [];

  const productMap = new Map<number, ProductSelectOption>();
  products.forEach((item) => {
    productMap.set(Number(item.id), item);
  });

  return (detail.lines ?? []).map((line, index) => {
    const productId = Number(line.productId ?? line.productTableId);
    const product = productMap.get(productId);
    const markingNumbers = (line.items ?? [])
      .map((item) => item.markingNumber?.trim())
      .filter((item): item is string => Boolean(item));

    return {
      key: line.id || index + 1,
      id: line.id,
      indexId: index + 1,
      name: line.productName,
      counterpartyId: detail.counterpartyId ?? null,
      product: line.productName,
      productId,
      productName: line.productName,
      sapCode: getProductCode(product),
      qty: line.quantity,
      serialNumber: (line.items ?? [])
        .map((item) => item.serialNumber?.trim())
        .filter(Boolean)
        .join("\n"),
      currencyId: detail.currencyId ?? 1,
      currency: detail.currencyName,
      markingNumber: markingNumbers.join("\n"),
      markingNumbers,
      price: line.unitPrice ?? line.price ?? null,
      pricePerUom: line.unitPrice ?? line.price ?? null,
      unitId: product?.unitId ?? null,
      unitCode: product?.unitCode ?? null,
      unitName: product?.unitName ?? product?.unit ?? null,
      mxik: product?.mxik ?? getProductCode(product),
      vatRateId: line.vatRateId ?? null,
      vatRates: null,
      isSerial: false,
      isPieceTracked: Boolean(product?.isPieceTracked),
    };
  });
};

const PurchaseImportPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const purchaseId = Number(params.id);
  const isEdit = Boolean(purchaseId);
  const [headerDraft, setHeaderDraft] =
    useLocalStorage<PurchaseImportHeaderDraft>(
      PURCHASE_IMPORT_DRAFT_HEADER_KEY,
      getDefaultPurchaseImportHeader(),
    );
  const [excelData, setExcelData] = useLocalStorage<PurchaseImportRow[]>(
    PURCHASE_IMPORT_DRAFT_LINES_KEY,
    [],
  );
  const [productWithCount, setProductWithCount] = useLocalStorage<boolean>(
    PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY,
    false,
  );
  const [withDiscount, _setWithWithDiscount] = useState(false);
  const [purchaseMode, setPurchaseMode] = useLocalStorage<PurchaseMode>(
    PURCHASE_IMPORT_DRAFT_MODE_KEY,
    "goods",
  );
  const { height } = useWindowSize();
  const importPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const detailQuery = useGetDetailPurchase(purchaseId);
  const detailData = detailQuery.data;
  const confirmMutation = useConfirmPurchase(purchaseId);
  const cancelMutation = useCancelPurchase(purchaseId);
  const isDraft = detailData?.statusId === 1;
  const isSubmitting =
    importPurchase.isPending ||
    updatePurchase.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending;

  const detailPurchaseMode = useMemo<PurchaseMode>(() => {
    if (detailData?.serviceLines?.length) return "services";
    return "goods";
  }, [detailData?.serviceLines?.length]);

  useEffect(() => {
    if (!isEdit || !detailData) return;

    if (detailData.statusId !== 1) {
      navigate(`/main/purchases/purchase/${purchaseId}`, { replace: true });
      return;
    }

    if (purchaseMode !== detailPurchaseMode) {
      setPurchaseMode(detailPurchaseMode);
      setProductWithCount(detailPurchaseMode === "services");
    }
  }, [
    detailData,
    detailPurchaseMode,
    isEdit,
    navigate,
    productWithCount,
    purchaseId,
    purchaseMode,
    setProductWithCount,
    setPurchaseMode,
  ]);

  const baseColumnConfig = useMemo(
    () => getBaseColumnConfig(productWithCount, withDiscount),
    [productWithCount, withDiscount],
  );

  const [selectBoxOptions, setSelectBoxOptions] = useState<SelectBoxOptions[]>(
    () => toSelectBoxOptions(baseColumnConfig),
  );
  const [productCreateOpen, setProductCreateOpen] = useState(false);
  const [missingProductRows, setMissingProductRows] = useState<
    PurchaseImportRow[]
  >([]);
  const [markingRowIndex, setMarkingRowIndex] = useState<number | null>(null);
  const [markingInput, setMarkingInput] = useState("");

  const columnConfig = useMemo<ImportColumnConfig[]>(
    () => buildColumnConfig(baseColumnConfig, selectBoxOptions),
    [baseColumnConfig, selectBoxOptions],
  );

  const {
    data,
    isFetching,
    isLoading,
    isServicesLoading,
    isServicesSuccess,
    isSuccess,
    itemOptions,
    productByCode,
    productIdBySapCode,
    refetchProducts,
    unitOptions,
    vatRateOptions,
  } = usePurchaseImportOptions(purchaseMode);

  const detailLines = useMemo(
    () => mapDetailLinesToRows(detailData, itemOptions),
    [detailData, itemOptions],
  );

  const initialLines = useMemo(
    () =>
      isEdit
        ? detailLines
        : excelData.length
          ? excelData
          : [
              createEmptyPurchaseRow({
                indexId: 1,
                counterpartyId: headerDraft.counterpartyId,
                currencyId: headerDraft.currencyId,
                purchaseMode,
                productWithCount,
              }),
            ],
    [
      detailLines,
      excelData,
      headerDraft.counterpartyId,
      headerDraft.currencyId,
      isEdit,
      productWithCount,
      purchaseMode,
    ],
  );

  const initialValues = useMemo<PurchaseImportForm>(
    () =>
      isEdit && detailData
        ? {
            docDate: detailData.docDate,
            counterpartyId: detailData.counterpartyId ?? null,
            currencyId: detailData.currencyId ?? null,
            contractId:
              "contractId" in detailData
                ? (detailData.contractId as number | null)
                : null,
            warehouseId: detailData.warehouseId ?? null,
            comment: detailData.comment ?? "",
            lines: initialLines,
          }
        : {
            ...headerDraft,
            lines: initialLines,
          },
    [detailData, headerDraft, initialLines, isEdit],
  );

  const formik = useFormik<PurchaseImportForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: purchaseValidationSchema,
    onSubmit: async (values) => {
      const saved = await persistPurchase(values, true);
      if (!saved || isEdit) return;

      const defaultHeader = getDefaultPurchaseImportHeader();
      const defaultDraftLines: PurchaseImportRow[] = [];
      const defaultLines = [
        createEmptyPurchaseRow({
          indexId: 1,
          counterpartyId: defaultHeader.counterpartyId,
          currencyId: defaultHeader.currencyId,
          purchaseMode: "goods",
          productWithCount: false,
        }),
      ];
      setHeaderDraft(defaultHeader);
      setExcelData(defaultDraftLines);
      setProductWithCount(false);
      setPurchaseMode("goods");
      formik.resetForm({
        values: {
          ...defaultHeader,
          lines: defaultLines,
        },
      });
      navigate(-1);
    },
  });

  const persistPurchase = useCallback(
    async (values: PurchaseImportForm, showSuccess: boolean) => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        formik.setTouched(buildTouched(values));
        toast.error("Majburiy maydonlarni to'ldiring");
        return false;
      }

      const completedRows = values.lines.filter(isCompletePurchaseLine);
      const unmarkedRow = getUnmarkedPieceTrackedRow(
        completedRows,
        purchaseMode,
      );

      if (unmarkedRow) {
        toast.error(
          `${unmarkedRow.product || unmarkedRow.productName || "Mahsulot"} uchun markirovka kiriting`,
        );
        return false;
      }

      const payload = toPurchaseCreatePayload(values, completedRows, purchaseMode);
      if (!payload.lines.length) {
        toast.error("Kamida bitta mahsulot yoki xizmat kiriting");
        return false;
      }

      try {
        if (isEdit && purchaseId) {
          await updatePurchase.mutateAsync({
            id: purchaseId,
            payload,
          });
          if (showSuccess) {
            toast.success("Hujjat saqlandi");
          }
          return true;
        }

        await importPurchase.mutateAsync(payload);
        if (showSuccess) {
          toast.success("Hujjat saqlandi");
        }
        return true;
      } catch (error) {
        errorHandlers(error);
        return false;
      }
    },
    [
      formik,
      importPurchase,
      isEdit,
      purchaseId,
      purchaseMode,
      updatePurchase,
    ],
  );

  const ensureSavedBeforeAction = useCallback(async () => {
    if (!formik.dirty) return true;
    return persistPurchase(formik.values, false);
  }, [formik.dirty, formik.values, persistPurchase]);

  const setDraftFieldValue: typeof formik.setFieldValue = useCallback(
    (field, value, shouldValidate) => {
      if (
        !isEdit &&
        (field === "docDate" ||
          field === "counterpartyId" ||
          field === "contractId" ||
          field === "currencyId" ||
          field === "warehouseId" ||
          field === "comment")
      ) {
        setHeaderDraft((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
      if (!isEdit && field === "lines" && Array.isArray(value)) {
        setExcelData(value as PurchaseImportRow[]);
      }

      return formik.setFieldValue(field, value, shouldValidate);
    },
    [formik, isEdit, setExcelData, setHeaderDraft],
  );

  const draftFormik = useMemo(
    () => ({
      ...formik,
      setFieldValue: setDraftFieldValue,
    }),
    [formik, setDraftFieldValue],
  );

  const resolveProductIds = useCallback(
    (rows: PurchaseImportRow[]) =>
      rows.map((item) => {
        const normalizedCode = String(item.sapCode ?? "").trim();
        const product =
          (item.productId
            ? itemOptions.find((option) => option.id === item.productId)
            : undefined) ??
          productByCode.get(normalizedCode);
        const unitPrice = getProductPrice(product);
        return {
          ...item,
          productId: item.productId ?? product?.id ?? null,
          product: item.product || product?.name || "",
          productName: item.productName || product?.name || "",
          name: item.name || product?.name || "",
          mxik: item.mxik ?? product?.mxik ?? getProductCode(product),
          unitId: item.unitId ?? product?.unitId ?? null,
          unitCode: item.unitCode ?? product?.unitCode ?? null,
          unitName: item.unitName ?? product?.unitName ?? product?.unit ?? null,
          price: item.price || unitPrice || null,
          pricePerUom: item.pricePerUom || unitPrice || null,
          isPieceTracked: Boolean(product?.isPieceTracked),
          ...(product?.isPieceTracked
            ? {}
            : {
                markingNumber: "",
                markingNumbers: [],
              }),
        };
      }),
    [itemOptions, productByCode],
  );

  const commitRows = useCallback(
    (rows: PurchaseImportRow[]) => {
      if (!isEdit) {
        setExcelData(rows);
      }
      formik.setFieldValue("lines", rows, false);
    },
    [formik, isEdit, setExcelData],
  );

  const handleRowValueChange = useCallback(
    (rowIndex: number, patch: Partial<PurchaseImportRow>) => {
      const nextRows = formik.values.lines.map((item, index) =>
        index === rowIndex ? { ...item, ...patch } : item,
      );
      commitRows(nextRows);
    },
    [commitRows, formik.values.lines],
  );

  const handleItemSelect = useCallback(
    (rowIndex: number, value: number) => {
      const currentRows = formik.values.lines;
      const selected = itemOptions.find((item) => item.id === value);
      const productCode = getProductCode(selected);
      const unitPrice = getProductPrice(selected);
      const isPieceTracked =
        purchaseMode === "goods" && Boolean(selected?.isPieceTracked);
      const currentMarkings = toMarkingNumbers(currentRows[rowIndex]);
      handleRowValueChange(rowIndex, {
        productId: value,
        product: selected?.name ?? "",
        productName: selected?.name ?? "",
        name: selected?.name ?? "",
        sapCode: productCode || currentRows[rowIndex]?.sapCode || "",
        mxik: selected?.mxik ?? productCode,
        unitId: selected?.unitId ?? (currentRows[rowIndex]?.unitId as number | null),
        unitCode: selected?.unitCode ?? null,
        unitName: selected?.unitName ?? selected?.unit ?? null,
        price: unitPrice || currentRows[rowIndex]?.price || null,
        pricePerUom: unitPrice || currentRows[rowIndex]?.pricePerUom || null,
        isPieceTracked,
        qty: isPieceTracked
          ? currentMarkings.length
          : currentRows[rowIndex]?.qty,
        markingNumber: isPieceTracked
          ? currentRows[rowIndex]?.markingNumber
          : "",
        markingNumbers: isPieceTracked ? currentMarkings : [],
      });
    },
    [formik.values.lines, handleRowValueChange, itemOptions, purchaseMode],
  );

  const openMarkingModal = useCallback(
    (rowIndex: number) => {
      if (!formik.values.lines[rowIndex]?.isPieceTracked) {
        toast.error("Bu mahsulot markirovkasiz");
        return;
      }
      setMarkingRowIndex(rowIndex);
      setMarkingInput("");
    },
    [formik.values.lines],
  );

  const closeMarkingModal = useCallback(() => {
    setMarkingRowIndex(null);
    setMarkingInput("");
  }, []);

  const updateRowMarkings = useCallback(
    (rowIndex: number, markingNumbers: string[]) => {
      handleRowValueChange(rowIndex, {
        markingNumbers,
        markingNumber: markingNumbers.join("\n"),
        qty: markingNumbers.length,
      });
    },
    [handleRowValueChange],
  );

  const handleAddMarking = useCallback(() => {
    if (markingRowIndex === null) return;
    const nextMarkings = parseMarkingInput(markingInput);
    if (!nextMarkings.length) return;

    const current = toMarkingNumbers(formik.values.lines[markingRowIndex]);
    const currentSet = new Set(current);
    const uniqueMarkings = nextMarkings.filter((marking) => {
      if (currentSet.has(marking)) return false;
      currentSet.add(marking);
      return true;
    });

    if (!uniqueMarkings.length) {
      toast.error("Kiritilgan markirovkalar avval qo'shilgan");
      return;
    }

    updateRowMarkings(markingRowIndex, [...current, ...uniqueMarkings]);
    setMarkingInput("");
  }, [formik.values.lines, markingInput, markingRowIndex, updateRowMarkings]);

  const handleMarkingPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      const pastedText = event.clipboardData.getData("text");
      const pastedMarkings = parseMarkingInput(pastedText);

      if (pastedMarkings.length < 2) return;

      event.preventDefault();
      setMarkingInput((prev) =>
        [...parseMarkingInput(prev), ...pastedMarkings].join(" "),
      );
    },
    [],
  );

  const handleRemoveMarking = useCallback(
    (marking: string) => {
      if (markingRowIndex === null) return;
      const nextMarkings = toMarkingNumbers(
        formik.values.lines[markingRowIndex],
      ).filter((item) => item !== marking);
      updateRowMarkings(markingRowIndex, nextMarkings);
    },
    [formik.values.lines, markingRowIndex, updateRowMarkings],
  );

  const handleExcelDataChange = useCallback<
    Dispatch<SetStateAction<PurchaseImportRow[]>>
  >(
    (value) => {
      if (isEdit) {
        const nextRaw =
          typeof value === "function" ? value(formik.values.lines) : value;
        const nextRows = resolveProductIds(nextRaw);
        formik.setFieldValue("lines", nextRows, false);
        return;
      }

      setExcelData((prev) => {
        const nextRaw = typeof value === "function" ? value(prev) : value;
        const nextRows = resolveProductIds(nextRaw);
        formik.setFieldValue("lines", nextRows, false);
        return nextRows;
      });
    },
    [formik, formik.values.lines, isEdit, resolveProductIds, setExcelData],
  );

  const handleAddManualRow = useCallback(() => {
    const indexId = formik.values.lines.length + 1;
    commitRows([
      ...formik.values.lines,
      createEmptyPurchaseRow({
        indexId,
        counterpartyId: formik.values.counterpartyId,
        currencyId: formik.values.currencyId,
        purchaseMode,
        productWithCount,
      }),
    ]);
  }, [
    commitRows,
    formik.values.counterpartyId,
    formik.values.currencyId,
    formik.values.lines,
    productWithCount,
    purchaseMode,
  ]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const nextRows = formik.values.lines
        .filter((_, index) => index !== rowIndex)
        .map((item, index) => ({
          ...item,
          indexId: index + 1,
        }));
      commitRows(
        nextRows.length
          ? nextRows
          : [
              createEmptyPurchaseRow({
                indexId: 1,
                counterpartyId: formik.values.counterpartyId,
                currencyId: formik.values.currencyId,
                purchaseMode,
                productWithCount,
              }),
            ],
      );
    },
    [
      commitRows,
      formik.values.counterpartyId,
      formik.values.currencyId,
      formik.values.lines,
      productWithCount,
      purchaseMode,
    ],
  );

  const handleCellCommit = useCallback(
    (rowIndex: number, dataIndex: string, rawValue: string) => {
      const currentRows = formik.values.lines;

      if (!currentRows[rowIndex]) {
        return;
      }

      const nextRows = [...currentRows];
      const targetRow = { ...nextRows[rowIndex] } as PurchaseImportRow;

      if (numericImportColumns.has(dataIndex)) {
        const parsed = Number(rawValue);
        (targetRow as Record<string, unknown>)[dataIndex] = Number.isNaN(parsed)
          ? null
          : parsed;
      } else {
        (targetRow as Record<string, unknown>)[dataIndex] = rawValue;
      }

      if (dataIndex === "sapCode") {
        const selected = productByCode.get(String(rawValue).trim());
        const unitPrice = getProductPrice(selected);
        const isPieceTracked =
          purchaseMode === "goods" && Boolean(selected?.isPieceTracked);
        targetRow.productId = selected?.id ?? null;
        targetRow.product = selected?.name ?? "";
        targetRow.productName = selected?.name ?? "";
        targetRow.name = selected?.name ?? "";
        targetRow.mxik = selected?.mxik ?? getProductCode(selected);
        targetRow.unitId = selected?.unitId ?? null;
        targetRow.unitCode = selected?.unitCode ?? null;
        targetRow.unitName = selected?.unitName ?? selected?.unit ?? null;
        targetRow.price = targetRow.price || unitPrice || null;
        targetRow.pricePerUom = targetRow.pricePerUom || unitPrice || null;
        targetRow.isPieceTracked = isPieceTracked;
        if (!isPieceTracked) {
          targetRow.markingNumber = "";
          targetRow.markingNumbers = [];
          targetRow.qty = getNumber(targetRow.qty) || 1;
        } else {
          targetRow.qty = toMarkingNumbers(targetRow).length;
        }
      }

      const previousValue = (currentRows[rowIndex] as Record<string, unknown>)[
        dataIndex
      ];
      const nextValue = (targetRow as Record<string, unknown>)[dataIndex];
      if (previousValue === nextValue) {
        return;
      }

      nextRows[rowIndex] = targetRow;
      commitRows(nextRows);
    },
    [commitRows, formik.values.lines, productByCode, purchaseMode],
  );

  const isSapCodeValid = useCallback(
    (value: unknown) => {
      const normalized = String(value ?? "").trim();
      if (!normalized) {
        return false;
      }
      if (!data) {
        return true;
      }

      return productIdBySapCode.has(normalized);
    },
    [data, productIdBySapCode],
  );

  const tableColumns = usePurchaseImportColumns({
    columnConfig,
    handleCellCommit,
    handleDeleteRow,
    handleItemSelect,
    handleRowValueChange,
    isLoading,
    isSapCodeValid,
    isServicesLoading,
    itemOptions,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
  });

  useEffect(() => {
    const hasLoadedOptions =
      purchaseMode === "goods" ? isSuccess && data : isServicesSuccess;
    if (hasLoadedOptions && formik.values.lines.length > 0) {
      const updated = resolveProductIds(formik.values.lines);
      const timeoutId = window.setTimeout(() => commitRows(updated), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [
    commitRows,
    data,
    formik.values.lines,
    isServicesSuccess,
    isSuccess,
    purchaseMode,
    resolveProductIds,
  ]);

  const handleDeleteSapCodes = () => {
    const filteredData = formik.values.lines?.filter((item) => item.productId);
    const nextRows = filteredData ?? [];
    commitRows(nextRows);
    toast.success("Topilmagan sab kodlar o'chirildi");
  };

  const handleOpenMissingProductsModal = () => {
    const rows =
      formik.values.lines?.filter(
        (item) => String(item.sapCode ?? "").trim() && !item.productId,
      ) ?? [];
    setMissingProductRows(rows);
    setProductCreateOpen(true);
  };

  const foundedSapCodes = useMemo(
    () =>
      formik.values.lines?.filter(
        (item) => String(item.sapCode ?? "").trim() && !item.productId,
      ).length ?? 0,
    [formik.values.lines],
  );

  const hasSelectedRows = useMemo(
    () => formik.values.lines.some((item) => Boolean(item.productId)),
    [formik.values.lines],
  );

  const handlePurchaseModeChange = useCallback(
    (value: PurchaseMode) => {
      setPurchaseMode(value);
      setProductWithCount(value === "services");
      setSelectBoxOptions(
        toSelectBoxOptions(
          getBaseColumnConfig(value === "services", withDiscount),
        ),
      );
    },
    [setProductWithCount, setPurchaseMode, withDiscount],
  );

  const totals = useMemo(
    () => getPurchaseImportTotals(formik.values.lines ?? [], vatRateOptions),
    [formik.values.lines, vatRateOptions],
  );

  const activeMarkings = useMemo(
    () =>
      markingRowIndex === null
        ? []
        : toMarkingNumbers(formik.values.lines[markingRowIndex]),
    [formik.values.lines, markingRowIndex],
  );

  const handleConfirm = useCallback(async () => {
    if (!purchaseId || !isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await confirmMutation.mutateAsync();
      toast.success("Hujjat tasdiqlandi");
      navigate(`/main/purchases/purchase/${purchaseId}`);
    } catch (error) {
      errorHandlers(error);
    }
  }, [
    confirmMutation,
    ensureSavedBeforeAction,
    isDraft,
    navigate,
    purchaseId,
  ]);

  const handleCancelDocument = useCallback(async () => {
    if (!purchaseId || !isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await cancelMutation.mutateAsync();
      toast.success("Hujjat bekor qilindi");
      navigate(`/main/purchases/purchase/${purchaseId}`);
    } catch (error) {
      errorHandlers(error);
    }
  }, [
    cancelMutation,
    ensureSavedBeforeAction,
    isDraft,
    navigate,
    purchaseId,
  ]);

  if (isEdit && (detailQuery.isLoading || !detailData)) {
    return (
      <div className="flex justify-center p-10">
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <Form onFinish={formik.handleSubmit} layout="vertical">
        {isEdit && detailData && (
          <Card className="mb-3 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Hujjat raqami</div>
                <div className="text-lg font-semibold">
                  {detailData.docNumber || detailData.id}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ProcessStatusBadge
                  statusId={detailData.statusId}
                  statusName={detailData.statusName}
                />
                <Button
                  onClick={() => void formik.submitForm()}
                  loading={updatePurchase.isPending}
                >
                  Saqlash
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircle2 className="size-4" />}
                  loading={confirmMutation.isPending}
                  disabled={!isDraft || isSubmitting}
                  onClick={() => void handleConfirm()}
                >
                  Tasdiqlash
                </Button>
                <Button
                  danger
                  icon={<CircleX className="size-4" />}
                  loading={cancelMutation.isPending}
                  disabled={!isDraft || isSubmitting}
                  onClick={() => void handleCancelDocument()}
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
          </Card>
        )}

        <PurchaseImportHeader
          formik={draftFormik}
          hasSelectedRows={hasSelectedRows}
          onAddManualRow={handleAddManualRow}
          onBack={() => navigate(-1)}
          onExcelDataChange={handleExcelDataChange}
          onPurchaseModeChange={handlePurchaseModeChange}
          purchaseMode={purchaseMode}
          selectBoxOptions={selectBoxOptions}
          setSelectBoxOptions={setSelectBoxOptions}
        />
        <PurchaseImportLinesSection
          columns={tableColumns}
          comment={formik.values.comment}
          counterpartyId={formik.values.counterpartyId}
          foundedSapCodes={foundedSapCodes}
          height={height}
          isFetching={isFetching}
          isLoading={isLoading}
          lines={formik.values.lines}
          onAddManualRow={handleAddManualRow}
          onCommentChange={(value) =>
            draftFormik.setFieldValue("comment", value, false)
          }
          onDeleteSapCodes={handleDeleteSapCodes}
          onOpenMissingProductsModal={handleOpenMissingProductsModal}
          purchaseMode={purchaseMode}
          totals={totals}
        />
        <PurchaseMarkingModal
          open={markingRowIndex !== null}
          value={markingInput}
          markings={activeMarkings}
          onChange={setMarkingInput}
          onPaste={handleMarkingPaste}
          onAdd={handleAddMarking}
          onRemove={handleRemoveMarking}
          onClose={closeMarkingModal}
        />
        <ProductsCreateModal
          open={productCreateOpen}
          rows={missingProductRows}
          onRowsChange={setMissingProductRows}
          onClose={() => setProductCreateOpen(false)}
          onCreated={() => {
            void refetchProducts();
          }}
        />
      </Form>
    </div>
  );
};

export default PurchaseImportPage;
