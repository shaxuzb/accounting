import { Button, Form, Spin } from "antd";
import { useFormik } from "formik";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  PurchaseDetailLine,
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
  isCompletePurchaseLineWithAccounts,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseImportHeader from "../components/PurchaseImportHeader";
import ProductsCreateModal from "../components/ProductsCreateModal";
import PurchaseImportLinesSection from "../components/PurchaseImportLinesSection";
import PurchaseMarkingModal from "../components/PurchaseMarkingModal";
import PurchaseLineAccountsModal, {
  type PurchaseLineAccountValues,
} from "../components/PurchaseLineAccountsModal";
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
  getPurchaseModeFromDetail,
  getPurchaseImportTotals,
  isServiceDetailLine,
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
  supplierAccountId: values.supplierAccountId !== null,
  comment: Boolean(values.comment),
});

const getNumberValue = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getServiceProductId = (
  serviceLine: Record<string, unknown>,
) => {
  const candidates = [
    serviceLine.ownerId,
    serviceLine.serviceId,
    serviceLine.accountId,
    serviceLine.productTableId,
    serviceLine.productId,
  ];

  for (const candidate of candidates) {
    const next = getNumberValue(candidate, NaN);
    if (Number.isFinite(next) && next > 0) {
      return next;
    }
  }

  return null;
};

const mapDetailLinesToRows = (
  detail: PurchaseDetailData | undefined,
  products: ProductSelectOption[],
  purchaseMode: PurchaseMode,
): PurchaseImportRow[] => {
  if (!detail) return [];

  const productMap = new Map<number, ProductSelectOption>();
  products.forEach((item) => {
    productMap.set(Number(item.id), item);
  });

  if (purchaseMode === "services") {
    const productNameToId = new Map<string, number>();
    productMap.forEach((item) => {
      const normalizedName = String(item.name ?? "")
        .trim()
        .toLowerCase();
      if (normalizedName && !productNameToId.has(normalizedName)) {
        productNameToId.set(normalizedName, Number(item.id));
      }
    });

    const detailServiceLines = detail.serviceLines ?? [];
    const serviceLineIdSet = new Set<number>();
    detailServiceLines.forEach((line) => {
      const detailServiceLine = line as unknown as Record<string, unknown>;
      const serviceLineId = getNumberValue(detailServiceLine.id, NaN);
      if (Number.isFinite(serviceLineId)) {
        serviceLineIdSet.add(serviceLineId);
      }
    });

    const sourceServiceLines = [
      ...detailServiceLines,
      ...detail.lines.filter((line) => {
        const detailLine = line as unknown as Record<string, unknown>;
        const lineId = getNumberValue(detailLine.id, NaN);
        return (
          isServiceDetailLine(detailLine) &&
          Number.isFinite(lineId) &&
          !serviceLineIdSet.has(lineId)
        );
      }),
      ...detail.lines.filter((line) => {
        const detailLine = line as unknown as Record<string, unknown>;
        const lineId = getNumberValue(detailLine.id, NaN);
        if (Number.isFinite(lineId)) return false;
        return isServiceDetailLine(detailLine);
      }),
    ];

    const mappedLines = (
      sourceServiceLines.length ? sourceServiceLines : detail.lines
    ).map((line, index) => {
      const detailLine = line as unknown as Record<string, unknown>;
      const serviceName = String(
        detailLine.serviceName ??
          detailLine.name ??
          detailLine.expenseAccountName ??
          detailLine.accountName ??
          detailLine.productName ??
          "",
      ).trim();
      const detailServiceId = getServiceProductId(detailLine);
      const lineUnit = (detailLine.unit as Record<string, unknown>) ?? null;
      const lineUnitId = getNumberValue(
        (lineUnit as Record<string, unknown>)?.id ??
          (lineUnit as Record<string, unknown>)?.unitId ??
          detailLine.unitId,
        NaN,
      );
      const lineUnitCode = String(
        (lineUnit as Record<string, unknown>)?.code ??
          (lineUnit as Record<string, unknown>)?.unitCode ??
          detailLine.unitCode ??
          "",
      ).trim();
      const lineUnitName = String(
        (lineUnit as Record<string, unknown>)?.name ??
          (lineUnit as Record<string, unknown>)?.unitName ??
          detailLine.unitName ??
          "",
      ).trim();
      const detailServiceCandidateId = getNumberValue(detailServiceId, NaN);
      const nameMatchedProductId = productNameToId.get(serviceName.toLowerCase());
      const mappedProductId = Number.isFinite(detailServiceCandidateId)
        ? productMap.has(detailServiceCandidateId)
          ? detailServiceCandidateId
          : Number.isFinite(nameMatchedProductId)
            ? nameMatchedProductId
            : null
        : Number.isFinite(nameMatchedProductId)
          ? nameMatchedProductId
          : null;
      const resolvedProduct =
        mappedProductId !== null ? productMap.get(mappedProductId) : null;
      const markingNumbers = (Array.isArray(detailLine.items)
        ? detailLine.items
        : [])
        .map((item: Record<string, unknown>) =>
          typeof item.markingNumber === "string" ? item.markingNumber.trim() : "",
        )
        .filter((item): item is string => Boolean(item));
      const price = getNumberValue(
        (detailLine.unitPrice ?? detailLine.price) as unknown,
        NaN,
      );

      const lineId = getNumberValue(detailLine.id, NaN);

      return {
        key: lineId || mappedProductId || index + 1,
        id: Number.isFinite(lineId) ? lineId : null,
        indexId: index + 1,
        name: serviceName,
        counterpartyId: detail.counterpartyId ?? null,
        product: serviceName,
        productId: mappedProductId,
        productName: serviceName,
        sapCode: getProductCode(resolvedProduct),
        qty: getNumberValue(detailLine.quantity, 1),
        serialNumber: "",
        currencyId: detail.currencyId ?? 1,
        currency: detail.currencyName,
        markingNumber: markingNumbers.join("\n"),
        markingNumbers,
        price: Number.isFinite(price) ? price : null,
        pricePerUom: Number.isFinite(price) ? price : null,
        unitId:
          resolvedProduct?.unitId ??
          (Number.isFinite(lineUnitId) ? lineUnitId : null),
        unitCode: resolvedProduct?.unitCode || lineUnitCode || null,
        unitName:
          resolvedProduct?.unitName ??
          resolvedProduct?.unit ??
          (lineUnitName || null),
        mxik: resolvedProduct?.mxik ?? getProductCode(resolvedProduct),
        vatRateId: (detailLine.vatRateId as number | null) ?? null,
        vatRates: null,
        debitAccountId: getNumberValue(detailLine.debitAccountId, NaN) || null,
        vatAccountId: getNumberValue(detailLine.vatAccountId, NaN) || null,
        debitAccountName: String(detailLine.debitAccountName ?? ""),
        vatAccountName: String(detailLine.vatAccountName ?? ""),
        isSerial: false,
        isPieceTracked: Boolean(resolvedProduct?.isPieceTracked),
      };
    });

    if (mappedLines.length) return mappedLines;
  }

  return detail.lines.map((line, index) => {
    const detailLine = line as PurchaseDetailLine;
    const productId = Number(detailLine.productId ?? detailLine.productTableId);
    const product = productMap.get(productId);
    const markingNumbers = (detailLine.items ?? [])
      .map((item) => item.markingNumber?.trim())
      .filter((item): item is string => Boolean(item));

    return {
      key: detailLine.id || index + 1,
      id: detailLine.id,
      indexId: index + 1,
      name: detailLine.productName,
      counterpartyId: detail.counterpartyId ?? null,
      product: detailLine.productName,
      productId,
      productName: detailLine.productName,
      sapCode: getProductCode(product),
      qty: detailLine.quantity,
      serialNumber: (detailLine.items ?? [])
        .map((item) => item.serialNumber?.trim())
        .filter(Boolean)
        .join("\n"),
      currencyId: detail.currencyId ?? 1,
      currency: detail.currencyName,
      markingNumber: markingNumbers.join("\n"),
      markingNumbers,
      price: detailLine.unitPrice ?? detailLine.price ?? null,
      pricePerUom: detailLine.unitPrice ?? detailLine.price ?? null,
      unitId: product?.unitId ?? null,
      unitCode: product?.unitCode ?? null,
      unitName: product?.unitName ?? product?.unit ?? null,
      mxik: product?.mxik ?? getProductCode(product),
      vatRateId: detailLine.vatRateId ?? null,
      vatRates: null,
      debitAccountId: detailLine.debitAccountId ?? null,
      vatAccountId: detailLine.vatAccountId ?? null,
      debitAccountName: detailLine.debitAccountName,
      vatAccountName: detailLine.vatAccountName,
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
  const [productWithCountDraft, setProductWithCountDraft] = useLocalStorage<boolean>(
    PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY,
    false,
  );
  const [withDiscount, _setWithWithDiscount] = useState(false);
  const [purchaseModeDraft, setPurchaseModeDraft] = useLocalStorage<PurchaseMode>(
    PURCHASE_IMPORT_DRAFT_MODE_KEY,
    "goods",
  );
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>(
    isEdit ? "goods" : purchaseModeDraft,
  );
  const [productWithCount, setProductWithCount] = useState<boolean>(
    isEdit ? false : productWithCountDraft,
  );
  const isDraftStorageEnabledRef = useRef(true);
  const { height } = useWindowSize();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    () => (isEdit ? null : headerDraft.warehouseId ?? null),
  );
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
    serviceOptions,
  } = usePurchaseImportOptions(purchaseMode, selectedWarehouseId);

  const itemOptionsById = useMemo(
    () => new Map(itemOptions.map((item) => [item.id, item])),
    [itemOptions],
  );

  const detailPurchaseMode = useMemo(
    () => getPurchaseModeFromDetail(detailData, serviceOptions.map((item) => item.id)),
    [detailData, serviceOptions],
  );

  useEffect(() => {
    if (!isEdit || !detailData) return;

    if (detailData.statusId !== 1) {
      navigate(`/main/purchases/purchase/${purchaseId}`, { replace: true });
      return;
    }

    if (purchaseMode !== detailPurchaseMode) {
      setPurchaseMode(detailPurchaseMode);
      setProductWithCount(detailPurchaseMode === "services");
      if (!isEdit) {
        setPurchaseModeDraft(detailPurchaseMode);
        setProductWithCountDraft(detailPurchaseMode === "services");
      }
    }
  }, [
    detailData,
    detailPurchaseMode,
    isEdit,
    navigate,
    purchaseId,
    purchaseMode,
    setProductWithCount,
    setPurchaseMode,
    setProductWithCountDraft,
    setPurchaseModeDraft,
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
  const [accountRowIndex, setAccountRowIndex] = useState<number | null>(null);

  const columnConfig = useMemo<ImportColumnConfig[]>(
    () => buildColumnConfig(baseColumnConfig, selectBoxOptions),
    [baseColumnConfig, selectBoxOptions],
  );

  const detailLines = useMemo(
    () =>
      mapDetailLinesToRows(
        detailData,
        itemOptions,
        detailPurchaseMode,
      ),
    [detailData, detailPurchaseMode, itemOptions],
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
            supplierAccountId: detailData.supplierAccountId ?? null,
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
    enableReinitialize: isEdit,
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
      isDraftStorageEnabledRef.current = false;
      setHeaderDraft(defaultHeader);
      setExcelData(defaultDraftLines);
      setProductWithCount(false);
      setPurchaseMode("goods");
      setProductWithCountDraft(false);
      setPurchaseModeDraft("goods");
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

      const completedRows = values.lines.filter(
        isCompletePurchaseLineWithAccounts,
      );
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

      const payload = toPurchaseCreatePayload(
        values,
        completedRows,
        purchaseMode,
      );
      if (!completedRows.length) {
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
    [formik, importPurchase, isEdit, purchaseId, purchaseMode, updatePurchase],
  );

  const ensureSavedBeforeAction = useCallback(async () => {
    if (!formik.dirty) return true;
    return persistPurchase(formik.values, false);
  }, [formik.dirty, formik.values, persistPurchase]);

  const setDraftFieldValue: typeof formik.setFieldValue = useCallback(
    (field, value, shouldValidate) => {
      if (
        !isEdit &&
        field === "counterpartyId" &&
        value !== formik.values.counterpartyId
      ) {
        if (isDraftStorageEnabledRef.current) {
          setHeaderDraft((prev) => ({
            ...prev,
            counterpartyId: value,
            contractId: null,
          }));
        }

        return formik.setValues(
          {
            ...formik.values,
            counterpartyId: value,
            contractId: null,
          },
          shouldValidate,
        );
      }
      if (
        !isEdit &&
        (field === "docDate" ||
          field === "counterpartyId" ||
          field === "contractId" ||
          field === "currencyId" ||
          field === "warehouseId" ||
          field === "supplierAccountId" ||
          field === "comment")
      ) {
        if (isDraftStorageEnabledRef.current) {
          setHeaderDraft((prev) => ({
            ...prev,
            [field]: value,
          }));
        }
      }
      if (!isEdit && field === "lines" && Array.isArray(value)) {
        if (isDraftStorageEnabledRef.current) {
          setExcelData(value as PurchaseImportRow[]);
        }
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

  useEffect(() => {
    setSelectedWarehouseId(formik.values.warehouseId);
  }, [formik.values.warehouseId]);

  const resolveProductIds = useCallback(
    (rows: PurchaseImportRow[]) => {
      let hasChanges = false;
      const updated = rows.map((item) => {
        const normalizedCode = String(item.sapCode ?? "").trim();
        const product =
          (item.productId
            ? itemOptionsById.get(item.productId)
            : undefined) ?? productByCode.get(normalizedCode);
        const unitPrice = getProductPrice(product);
        const resolved = {
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

        const normalizedMarkingNumbers = (item.markingNumbers ?? []).join("|");
        const resolvedMarkingNumbers = (resolved.markingNumbers ?? []).join("|");
        const changed =
          resolved.productId !== item.productId ||
          resolved.product !== item.product ||
          resolved.productName !== item.productName ||
          resolved.name !== item.name ||
          resolved.mxik !== item.mxik ||
          resolved.unitId !== item.unitId ||
          resolved.unitCode !== item.unitCode ||
          resolved.unitName !== item.unitName ||
          resolved.price !== item.price ||
          resolved.pricePerUom !== item.pricePerUom ||
          resolved.isPieceTracked !== item.isPieceTracked ||
          resolved.markingNumber !== item.markingNumber ||
          normalizedMarkingNumbers !== resolvedMarkingNumbers;

        if (!changed) {
          return item;
        }

        hasChanges = true;
        return resolved;
      });

      return hasChanges ? updated : rows;
    },
    [itemOptionsById, productByCode],
  );

  const linesRef = useRef(formik.values.lines);
  useEffect(() => {
    linesRef.current = formik.values.lines;
  }, [formik.values.lines]);

  const commitRows = useCallback(
    (rows: PurchaseImportRow[]) => {
      if (rows === linesRef.current) return;
      if (!isEdit && isDraftStorageEnabledRef.current) {
        setExcelData(rows);
      }
      formik.setFieldValue("lines", rows, false);
    },
    [formik, isEdit, setExcelData],
  );

  const handleRowValueChange = useCallback(
    (rowIndex: number, patch: Partial<PurchaseImportRow>) => {
      const nextRows = linesRef.current.map((item, index) =>
        index === rowIndex ? { ...item, ...patch } : item,
      );
      commitRows(nextRows);
    },
    [commitRows],
  );

  const handleApplyLineAccounts = useCallback(
    (values: PurchaseLineAccountValues, applyToAll: boolean) => {
      const nextRows = linesRef.current.map((item, index) =>
        applyToAll || index === accountRowIndex
          ? {
              ...item,
              debitAccountId: values.debitAccountId,
              debitAccountName: values.debitAccountName,
              vatAccountId: values.vatAccountId,
              vatAccountName: values.vatAccountName,
            }
          : item,
      );
      commitRows(nextRows);
      setAccountRowIndex(null);
    },
    [accountRowIndex, commitRows],
  );

  const openAccountModal = useCallback((rowIndex: number) => {
    setAccountRowIndex(rowIndex);
  }, []);

  const handleItemSelect = useCallback(
    (rowIndex: number, value: number) => {
      const currentRows = linesRef.current;
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
        unitId:
          selected?.unitId ?? (currentRows[rowIndex]?.unitId as number | null),
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
    [handleRowValueChange, itemOptions, purchaseMode],
  );

  const openMarkingModal = useCallback(
    (rowIndex: number) => {
      if (!linesRef.current[rowIndex]?.isPieceTracked) {
        toast.error("Bu mahsulot markirovkasiz");
        return;
      }
      setMarkingRowIndex(rowIndex);
      setMarkingInput("");
    },
    [],
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

    const current = toMarkingNumbers(linesRef.current[markingRowIndex]);
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
  }, [markingInput, markingRowIndex, updateRowMarkings]);

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
      const nextMarkings = toMarkingNumbers(linesRef.current[markingRowIndex]).filter(
        (item) => item !== marking,
      );
      updateRowMarkings(markingRowIndex, nextMarkings);
    },
    [markingRowIndex, updateRowMarkings],
  );

  const handleExcelDataChange = useCallback<
    Dispatch<SetStateAction<PurchaseImportRow[]>>
  >(
    (value) => {
      if (isEdit) {
        const nextRaw = typeof value === "function" ? value(linesRef.current) : value;
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
    [formik.setFieldValue, isEdit, setExcelData],
  );

  const handleAddManualRow = useCallback(() => {
    const indexId = linesRef.current.length + 1;
    commitRows([
      ...linesRef.current,
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
    productWithCount,
    purchaseMode,
  ]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const nextRows = linesRef.current
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
      productWithCount,
      purchaseMode,
    ],
  );

  const handleCellCommit = useCallback(
    (rowIndex: number, dataIndex: string, rawValue: string) => {
      const currentRows = linesRef.current;

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
    [commitRows, productByCode, purchaseMode],
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
    openAccountModal,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
  });

  useEffect(() => {
    const hasLoadedOptions =
      purchaseMode === "goods" ? isSuccess && data : isServicesSuccess;
    if (!hasLoadedOptions || linesRef.current.length === 0) return;

    const updated = resolveProductIds(linesRef.current);
    if (updated === linesRef.current) return;

    const timeoutId = window.setTimeout(() => commitRows(updated), 0);
    return () => window.clearTimeout(timeoutId);
  }, [commitRows, data, isServicesSuccess, isSuccess, purchaseMode, resolveProductIds]);

  const handleDeleteSapCodes = useCallback(() => {
    const filteredData = linesRef.current?.filter((item) => item.productId);
    const nextRows = filteredData ?? [];
    commitRows(nextRows);
    toast.success("Topilmagan sab kodlar o'chirildi");
  }, [commitRows]);

  const handleOpenMissingProductsModal = useCallback(() => {
    const rows =
      linesRef.current?.filter(
        (item) => String(item.sapCode ?? "").trim() && !item.productId,
      ) ?? [];
    setMissingProductRows(rows);
    setProductCreateOpen(true);
  }, []);

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
      if (!isEdit) {
        setPurchaseModeDraft(value);
        setProductWithCountDraft(value === "services");
      }
      setSelectBoxOptions(
        toSelectBoxOptions(
          getBaseColumnConfig(value === "services", withDiscount),
        ),
      );
    },
    [
      isEdit,
      setProductWithCount,
      setProductWithCountDraft,
      setPurchaseMode,
      setPurchaseModeDraft,
      withDiscount,
    ],
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
      navigate(-1);
    } catch (error) {
      errorHandlers(error);
    }
  }, [confirmMutation, ensureSavedBeforeAction, isDraft, navigate, purchaseId]);

  const handleCommentChange = useCallback(
    (value: string) => draftFormik.setFieldValue("comment", value, false),
    [draftFormik],
  );

  const handleCancelDocument = useCallback(async () => {
    if (!purchaseId || !isDraft) return;

    const ready = await ensureSavedBeforeAction();
    if (!ready) return;

    try {
      await cancelMutation.mutateAsync();
      toast.success("Hujjat bekor qilindi");
      navigate(-1);
    } catch (error) {
      errorHandlers(error);
    }
  }, [cancelMutation, ensureSavedBeforeAction, isDraft, navigate, purchaseId]);

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
                <div className="text-sm text-muted-foreground">
                  Hujjat raqami
                </div>
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
          onCommentChange={handleCommentChange}
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
        <PurchaseLineAccountsModal
          open={accountRowIndex !== null}
          line={
            accountRowIndex === null
              ? null
              : formik.values.lines[accountRowIndex] ?? null
          }
          onClose={() => setAccountRowIndex(null)}
          onApply={handleApplyLineAccounts}
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
