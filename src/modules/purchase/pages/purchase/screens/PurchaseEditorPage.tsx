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
import { useTranslation } from "react-i18next";
import { CheckCircle2, CircleX } from "lucide-react";
import useWindowSize from "@/shared/hooks/useWindowSize";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
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
  PurchaseProcessingMode,
} from "@/modules/purchase/pages/purchase/types/form";
import {
  createPurchaseValidationSchema,
  isCompletePurchaseLineWithAccounts,
} from "@/modules/purchase/pages/purchase/types/schema";
import PurchaseProcessingModeModal from "../components/PurchaseProcessingModeModal";
import ProductsCreateModal from "../components/ProductsCreateModal";
import PurchaseImportHeader from "../components/PurchaseImportHeader";
import PurchaseImportLinesSection from "../components/PurchaseImportLinesSection";
import PurchaseImportMxikActions from "../components/PurchaseImportMxikActions";
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
import { useResolvePurchaseDetailMode } from "../hooks/useResolvePurchaseDetailMode";
import { usePurchaseImportColumns } from "../hooks/usePurchaseImportColumns";
import { useGetPurchaseDocumentAccountDefaults } from "../hooks/useGetPurchaseDocumentAccountDefaults";
import { useUpdatePurchase } from "../hooks/useUpdatePurchase";
import { purchasePermissions } from "../constants/permissions";
import useLocalStorage from "@/hooks/UseLocalStorage";
import {
  buildMarkingQuantityPatch,
  createEmptyPurchaseRow,
  getDefaultPurchaseImportHeader,
  ensureStablePurchaseRowKeys,
  getNumber,
  getProductMxik,
  getProductPrice,
  getPurchaseImportTotals,
  isServiceDetailLine,
  getDuplicateMarkingNumber,
  getUnmarkedPieceTrackedRow,
  parseMarkingInput,
  getRowMxik,
  toMarkingNumbers,
  toPurchaseCreatePayload,
  toPurchaseUpdatePayload,
} from "../utils/purchaseImport";

const PURCHASE_IMPORT_DRAFT_HEADER_KEY = "purchase-import:draft:header";
const PURCHASE_IMPORT_DRAFT_LINES_KEY = "purchase-import:draft:lines";
const PURCHASE_IMPORT_DRAFT_PRODUCT_WITH_COUNT_KEY =
  "purchase-import:draft:product-with-count";
const PURCHASE_IMPORT_DRAFT_MODE_KEY = "purchase-import:draft:mode";

const buildTouched = () => ({
  docDate: true,
  counterpartyId: true,
  contractId: true,
  currencyId: true,
  warehouseId: true,
  supplierAccountId: true,
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
        mxik: getProductMxik(resolvedProduct),
        vatRateId: (detailLine.vatRateId as number | null) ?? null,
        vatRates: null,
        debitAccountId: getNumberValue(detailLine.debitAccountId, NaN) || null,
        vatAccountId: getNumberValue(detailLine.vatAccountId, NaN) || null,
        debitAccountName: String(detailLine.debitAccountName ?? ""),
        vatAccountName: String(detailLine.vatAccountName ?? ""),
        isSerial: false,
        isPieceTracked: Boolean(
          resolvedProduct?.isPieceTracked || markingNumbers.length,
        ),
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
      mxik: getProductMxik(product),
      vatRateId: detailLine.vatRateId ?? null,
      vatRates: null,
      debitAccountId: detailLine.debitAccountId ?? null,
      vatAccountId: detailLine.vatAccountId ?? null,
      debitAccountName: detailLine.debitAccountName,
      vatAccountName: detailLine.vatAccountName,
      isSerial: false,
      isPieceTracked: Boolean(product?.isPieceTracked || markingNumbers.length),
    };
  });
};

export interface PurchaseEditorProps {
  purchaseId?: number;
}

export const PurchaseEditor = ({
  purchaseId: purchaseIdProp,
}: PurchaseEditorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canConfirm = userPermissions.includes(purchasePermissions.confirm);
  const routePurchaseId = Number(params.id);
  const purchaseId = Number.isFinite(purchaseIdProp)
    ? Number(purchaseIdProp)
    : Number.isFinite(routePurchaseId)
      ? routePurchaseId
      : 0;
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
  const importPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const detailQuery = useGetDetailPurchase(purchaseId);
  const detailData = detailQuery.data;
  const confirmMutation = useConfirmPurchase(purchaseId);
  const cancelMutation = useCancelPurchase(purchaseId);
  const isDraft = detailData?.statusId === 1;
  const {
    mode: resolvedDetailPurchaseMode,
    isResolving: isDetailModeResolving,
  } = useResolvePurchaseDetailMode(detailData, isEdit);
  const detailPurchaseMode = resolvedDetailPurchaseMode ?? "goods";
  const isDetailModeReady = !isEdit || resolvedDetailPurchaseMode !== null;
  const optionsEnabled =
    !isEdit ||
    (Boolean(detailData) &&
      isDetailModeReady &&
      purchaseMode === detailPurchaseMode);
  const [processingModeModalOpen, setProcessingModeModalOpen] = useState(false);
  const [isCreateProcessing, setIsCreateProcessing] = useState(false);
  const isSubmitting =
    importPurchase.isPending ||
    updatePurchase.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    isCreateProcessing;
  const {
    data,
    isFetching,
    isLoading,
    isSuccess,
    itemOptions,
    productByMxik,
    knownMxiks,
    ambiguousMxiks,
    refetchProducts,
    unitOptions,
    vatRateOptions,
  } = usePurchaseImportOptions(purchaseMode, optionsEnabled);
  const { defaultAccounts } = useGetPurchaseDocumentAccountDefaults(
    purchaseMode,
    optionsEnabled,
  );

  const itemOptionsById = useMemo(
    () => new Map(itemOptions.map((item) => [item.id, item])),
    [itemOptions],
  );

  useEffect(() => {
    if (!isEdit || !detailData || !resolvedDetailPurchaseMode) return;

    if (detailData.statusId !== 1) {
      navigate(`/main/purchases/purchase/${purchaseId}`, { replace: true });
      return;
    }

    if (purchaseMode !== detailPurchaseMode) {
      const timeoutId = window.setTimeout(() => {
        setPurchaseMode(detailPurchaseMode);
        setProductWithCount(detailPurchaseMode === "services");
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [
    detailData,
    detailPurchaseMode,
    isEdit,
    navigate,
    purchaseId,
    purchaseMode,
    resolvedDetailPurchaseMode,
    setProductWithCount,
    setPurchaseMode,
  ]);

  const baseColumnConfig = useMemo(
    () => getBaseColumnConfig(productWithCount, withDiscount, t),
    [productWithCount, t, withDiscount],
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
          ? ensureStablePurchaseRowKeys(excelData)
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

  const validationSchema = useMemo(
    () => createPurchaseValidationSchema(t),
    [t],
  );

  const formik = useFormik<PurchaseImportForm>({
    initialValues,
    enableReinitialize: isEdit,
    validationSchema,
    onSubmit: async (values) => {
      if (!isEdit) {
        setProcessingModeModalOpen(true);
        return;
      }

      await persistPurchase(values, true);
    },
  });

  const persistPurchase = useCallback(
    async (
      values: PurchaseImportForm,
      showSuccess: boolean,
      processingMode: PurchaseProcessingMode = 1,
      shouldPersist = true,
    ) => {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length > 0) {
        formik.setTouched(buildTouched());
        toast.error(t("purchase.messages.fillRequired"));
        return false;
      }

      const completedRows = values.lines.filter(
        isCompletePurchaseLineWithAccounts,
      );
      const duplicateMarkingNumber = getDuplicateMarkingNumber(completedRows);

      if (duplicateMarkingNumber) {
        toast.error(
          t("purchase.messages.duplicateMarking", {
            marking: duplicateMarkingNumber,
          }),
        );
        return false;
      }

      const unmarkedRow = getUnmarkedPieceTrackedRow(
        completedRows,
        purchaseMode,
      );

      if (unmarkedRow) {
        toast.error(
          t("purchase.messages.markingRequired", {
            product:
              unmarkedRow.product ||
              unmarkedRow.productName ||
              t("purchase.fields.product"),
          }),
        );
        return false;
      }

      if (!completedRows.length) {
        toast.error(t("purchase.messages.lineRequired"));
        return false;
      }

      if (!shouldPersist) return true;

      try {
        if (isEdit && purchaseId) {
          await updatePurchase.mutateAsync({
            id: purchaseId,
            payload: toPurchaseUpdatePayload(
              values,
              completedRows,
              purchaseMode,
            ),
          });
          formik.resetForm({ values });
          if (showSuccess) {
            toast.success(t("purchase.messages.saved"));
          }
          return true;
        }

        await importPurchase.mutateAsync(
          toPurchaseCreatePayload(
            values,
            completedRows,
            purchaseMode,
            processingMode,
          ),
        );
        if (showSuccess) {
          toast.success(t("purchase.messages.saved"));
        }
        return true;
      } catch (error) {
        errorHandlers(error);
        return false;
      }
    },
    [formik, importPurchase, isEdit, purchaseId, purchaseMode, t, updatePurchase],
  );

  const finishNewPurchase = useCallback(() => {
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
  }, [
    formik,
    navigate,
    setExcelData,
    setHeaderDraft,
    setProductWithCountDraft,
    setPurchaseModeDraft,
  ]);

  const handleCreateSave = useCallback(
    async (processingMode: PurchaseProcessingMode) => {
      if (isEdit || isCreateProcessing) return;
      if (processingMode === 2 && !canConfirm) {
        toast.error(t("purchase.messages.confirmPermissionDenied"));
        return;
      }

      setProcessingModeModalOpen(false);
      setIsCreateProcessing(true);

      try {
        const saved = await persistPurchase(
          formik.values,
          true,
          processingMode,
        );
        if (saved) finishNewPurchase();
      } finally {
        setIsCreateProcessing(false);
      }
    },
    [
      finishNewPurchase,
      canConfirm,
      formik.values,
      isCreateProcessing,
      isEdit,
      persistPurchase,
      t,
    ],
  );

  const ensureSavedBeforeConfirm = useCallback(async () => {
    if (!formik.dirty) {
      return persistPurchase(formik.values, false, 1, false);
    }
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

  const resolveProductIds = useCallback(
    (rows: PurchaseImportRow[]) => {
      let hasChanges = false;
      const updated = rows.map((item) => {
        const normalizedMxik = getRowMxik(item);
        const product =
          (item.productId
            ? itemOptionsById.get(item.productId)
            : undefined) ?? productByMxik.get(normalizedMxik);
        const unitPrice = getProductPrice(product);
        const currentMarkings = toMarkingNumbers(item);
        const isPieceTracked = Boolean(
          item.isPieceTracked ||
            product?.isPieceTracked ||
            currentMarkings.length,
        );
        const resolvedMxik =
          item.productId && product
            ? getProductMxik(product) || normalizedMxik
            : normalizedMxik || getProductMxik(product);
        const markingPatch = isPieceTracked
          ? buildMarkingQuantityPatch(currentMarkings)
          : {
              markingNumber: "",
              markingNumbers: [],
            };
        const resolved = {
          ...item,
          productId: item.productId ?? product?.id ?? null,
          product: item.product || product?.name || "",
          productName: item.productName || product?.name || "",
          name: item.name || product?.name || "",
          mxik: resolvedMxik,
          sapCode: undefined,
          unitId: item.unitId ?? product?.unitId ?? null,
          unitCode: item.unitCode ?? product?.unitCode ?? null,
          unitName: item.unitName ?? product?.unitName ?? product?.unit ?? null,
          price: item.price || unitPrice || null,
          pricePerUom: item.pricePerUom || unitPrice || null,
          isPieceTracked,
          ...markingPatch,
        };

        const normalizedMarkingNumbers = currentMarkings.join("|");
        const resolvedMarkingNumbers = (resolved.markingNumbers ?? []).join("|");
        const changed =
          resolved.productId !== item.productId ||
          resolved.product !== item.product ||
          resolved.productName !== item.productName ||
          resolved.name !== item.name ||
          resolved.mxik !== item.mxik ||
          item.sapCode !== undefined ||
          resolved.unitId !== item.unitId ||
          resolved.unitCode !== item.unitCode ||
          resolved.unitName !== item.unitName ||
          resolved.price !== item.price ||
          resolved.pricePerUom !== item.pricePerUom ||
          resolved.qty !== item.qty ||
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
    [itemOptionsById, productByMxik],
  );

  const linesRef = useRef(formik.values.lines);
  useEffect(() => {
    linesRef.current = formik.values.lines;
  }, [formik.values.lines]);

  const commitRows = useCallback(
    (rows: PurchaseImportRow[]) => {
      const nextRows = ensureStablePurchaseRowKeys(rows);
      if (nextRows === linesRef.current) return;
      if (!isEdit && isDraftStorageEnabledRef.current) {
        setExcelData(nextRows);
      }
      formik.setFieldValue("lines", nextRows, false);
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
      const productMxik = getProductMxik(selected);
      const unitPrice = getProductPrice(selected);
      const currentMarkings = toMarkingNumbers(currentRows[rowIndex]);
      const isPieceTracked =
        purchaseMode === "goods" &&
        (typeof selected?.isPieceTracked === "boolean"
          ? selected.isPieceTracked
          : currentMarkings.length > 0);
      const markingPatch = isPieceTracked
        ? buildMarkingQuantityPatch(currentMarkings)
        : {
            qty: currentRows[rowIndex]?.qty,
            markingNumber: "",
            markingNumbers: [],
          };
      handleRowValueChange(rowIndex, {
        productId: value,
        product: selected?.name ?? "",
        productName: selected?.name ?? "",
        name: selected?.name ?? "",
        sapCode: undefined,
        mxik: productMxik,
        unitId:
          selected?.unitId ?? (currentRows[rowIndex]?.unitId as number | null),
        unitCode: selected?.unitCode ?? null,
        unitName: selected?.unitName ?? selected?.unit ?? null,
        price: unitPrice || currentRows[rowIndex]?.price || null,
        pricePerUom: unitPrice || currentRows[rowIndex]?.pricePerUom || null,
        isPieceTracked,
        ...markingPatch,
        debitAccountId:
          currentRows[rowIndex]?.debitAccountId ??
          defaultAccounts.debitAccountId,
        debitAccountName:
          currentRows[rowIndex]?.debitAccountName ||
          (currentRows[rowIndex]?.debitAccountId == null
            ? defaultAccounts.debitAccountName
            : ""),
        vatAccountId:
          currentRows[rowIndex]?.vatAccountId ?? defaultAccounts.vatAccountId,
        vatAccountName:
          currentRows[rowIndex]?.vatAccountName ||
          (currentRows[rowIndex]?.vatAccountId == null
            ? defaultAccounts.vatAccountName
            : ""),
      });
    },
    [defaultAccounts, handleRowValueChange, itemOptions, purchaseMode],
  );

  const openMarkingModal = useCallback(
    (rowIndex: number) => {
      if (!linesRef.current[rowIndex]?.isPieceTracked) {
        toast.error(t("purchase.messages.notPieceTracked"));
        return;
      }
      setMarkingRowIndex(rowIndex);
      setMarkingInput("");
    },
    [t],
  );

  const closeMarkingModal = useCallback(() => {
    setMarkingRowIndex(null);
    setMarkingInput("");
  }, []);

  const updateRowMarkings = useCallback(
    (rowIndex: number, markingNumbers: string[]) => {
      handleRowValueChange(
        rowIndex,
        buildMarkingQuantityPatch(markingNumbers),
      );
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
      toast.error(t("purchase.messages.duplicateMarkings"));
      return;
    }

    updateRowMarkings(markingRowIndex, [...current, ...uniqueMarkings]);
    setMarkingInput("");
  }, [markingInput, markingRowIndex, t, updateRowMarkings]);

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
        linesRef.current[markingRowIndex],
      ).filter((item) => item !== marking);
      updateRowMarkings(markingRowIndex, nextMarkings);
    },
    [markingRowIndex, updateRowMarkings],
  );

  const handleExcelDataChange = useCallback<
    Dispatch<SetStateAction<PurchaseImportRow[]>>
  >(
    (value) => {
      if (isEdit) {
        const nextRaw =
          typeof value === "function" ? value(linesRef.current) : value;
        const nextRows = ensureStablePurchaseRowKeys(
          resolveProductIds(nextRaw),
        );
        formik.setFieldValue("lines", nextRows, false);
        return;
      }

      setExcelData((prev) => {
        const nextRaw = typeof value === "function" ? value(prev) : value;
        const nextRows = ensureStablePurchaseRowKeys(
          resolveProductIds(nextRaw),
        );
        formik.setFieldValue("lines", nextRows, false);
        return nextRows;
      });
    },
    [formik, isEdit, resolveProductIds, setExcelData],
  );

  const createDefaultLine = useCallback(
    (indexId = 1) =>
      createEmptyPurchaseRow({
        indexId,
        counterpartyId: formik.values.counterpartyId,
        currencyId: formik.values.currencyId,
        purchaseMode,
        productWithCount,
      }),
    [
      formik.values.counterpartyId,
      formik.values.currencyId,
      productWithCount,
      purchaseMode,
    ],
  );

  const handleAddManualRow = useCallback(() => {
    const indexId = linesRef.current.length + 1;
    commitRows([...linesRef.current, createDefaultLine(indexId)]);
  }, [commitRows, createDefaultLine]);

  const handleClearExcelData = useCallback(() => {
    commitRows([createDefaultLine()]);
  }, [commitRows, createDefaultLine]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const nextRows = linesRef.current
        .filter((_, index) => index !== rowIndex)
        .map((item, index) => ({
          ...item,
          indexId: index + 1,
        }));
      commitRows(nextRows.length ? nextRows : [createDefaultLine()]);
    },
    [commitRows, createDefaultLine],
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

      if (dataIndex === "mxik") {
        const normalizedMxik = String(rawValue).trim();
        const selected = productByMxik.get(normalizedMxik);
        const unitPrice = getProductPrice(selected);
        const currentMarkings = toMarkingNumbers(targetRow);
        const isPieceTracked =
          purchaseMode === "goods" &&
          (typeof selected?.isPieceTracked === "boolean"
            ? selected.isPieceTracked
            : Boolean(targetRow.isPieceTracked || currentMarkings.length));
        targetRow.productId = selected?.id ?? null;
        targetRow.product = selected?.name ?? "";
        targetRow.productName = selected?.name ?? "";
        targetRow.name = selected?.name ?? "";
        targetRow.mxik = normalizedMxik;
        targetRow.sapCode = undefined;
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
          Object.assign(
            targetRow,
            buildMarkingQuantityPatch(currentMarkings),
          );
        }
        targetRow.debitAccountId =
          targetRow.debitAccountId ?? defaultAccounts.debitAccountId;
        targetRow.debitAccountName =
          targetRow.debitAccountName ||
          (targetRow.debitAccountId == null
            ? defaultAccounts.debitAccountName
            : "");
        targetRow.vatAccountId =
          targetRow.vatAccountId ?? defaultAccounts.vatAccountId;
        targetRow.vatAccountName =
          targetRow.vatAccountName ||
          (targetRow.vatAccountId == null ? defaultAccounts.vatAccountName : "");
      }

      const previousValue = (currentRows[rowIndex] as Record<string, unknown>)[
        dataIndex
      ];
      const nextValue = (targetRow as Record<string, unknown>)[dataIndex];
      if (previousValue === nextValue && dataIndex !== "mxik") {
        return;
      }

      nextRows[rowIndex] = targetRow;
      commitRows(nextRows);
    },
    [commitRows, defaultAccounts, productByMxik, purchaseMode],
  );

  const isMxikValid = useCallback(
    (value: unknown) => {
      const normalized = String(value ?? "").trim();
      if (!normalized) {
        return false;
      }
      if (!data) {
        return true;
      }

      return productByMxik.has(normalized);
    },
    [data, productByMxik],
  );

  const tableColumns = usePurchaseImportColumns({
    columnConfig,
    enabled: optionsEnabled,
    handleCellCommit,
    handleDeleteRow,
    handleItemSelect,
    handleRowValueChange,
    isLoading,
    isMxikValid,
    itemOptions,
    openAccountModal,
    openMarkingModal,
    purchaseMode,
    unitOptions,
    vatRateOptions,
  });

  useEffect(() => {
    if (!linesRef.current.some((item) => item.productId)) return;

    const updated = linesRef.current.map((item) => {
      if (!item.productId) return item;

      return {
        ...item,
        debitAccountId:
          item.debitAccountId ?? defaultAccounts.debitAccountId,
        debitAccountName:
          item.debitAccountName ||
          (item.debitAccountId == null ? defaultAccounts.debitAccountName : ""),
        vatAccountId: item.vatAccountId ?? defaultAccounts.vatAccountId,
        vatAccountName:
          item.vatAccountName ||
          (item.vatAccountId == null ? defaultAccounts.vatAccountName : ""),
      };
    });

    const changed = updated.some((item, index) => {
      const current = linesRef.current[index];
      return (
        item.debitAccountId !== current.debitAccountId ||
        item.debitAccountName !== current.debitAccountName ||
        item.vatAccountId !== current.vatAccountId ||
        item.vatAccountName !== current.vatAccountName
      );
    });

    if (changed) commitRows(updated);
  }, [commitRows, defaultAccounts]);

  useEffect(() => {
    const hasLoadedOptions = isSuccess && data;
    if (!hasLoadedOptions || linesRef.current.length === 0) return;

    const updated = resolveProductIds(linesRef.current);
    if (updated === linesRef.current) return;

    const timeoutId = window.setTimeout(() => commitRows(updated), 0);
    return () => window.clearTimeout(timeoutId);
  }, [commitRows, data, isSuccess, resolveProductIds]);

  const handleDeleteMissingMxiks = useCallback(() => {
    const nextRows = linesRef.current
      .filter((item) => {
        const mxik = getRowMxik(item);
        return !mxik || item.productId || knownMxiks.has(mxik);
      })
      .map((item, index) => ({ ...item, indexId: index + 1 }));
    commitRows(nextRows);
    toast.success(t("purchase.messages.missingMxiksDeleted"));
  }, [commitRows, knownMxiks, t]);

  const handleOpenMissingProductsModal = useCallback(() => {
    if (!isSuccess) {
      toast.error(t("purchase.messages.productListLoadError"));
      return;
    }

    const unresolvedRows = linesRef.current.filter(
      (item) => getRowMxik(item) && !item.productId,
    );
    const ambiguousCount = unresolvedRows.filter((item) =>
      ambiguousMxiks.has(getRowMxik(item)),
    ).length;
    const rows = Array.from(
      new Map(
        unresolvedRows
          .filter((item) => !knownMxiks.has(getRowMxik(item)))
          .map((item) => [getRowMxik(item), item] as const),
      ).values(),
    );

    if (ambiguousCount) {
      toast.error(
        t("purchase.messages.ambiguousMxik", { count: ambiguousCount }),
      );
    }
    if (!rows.length) return;

    setMissingProductRows(rows);
    setProductCreateOpen(true);
  }, [ambiguousMxiks, isSuccess, knownMxiks, t]);

  const closeProductsCreateModal = useCallback(() => {
    setProductCreateOpen(false);
    setMissingProductRows([]);
  }, []);

  const missingMxikCount = useMemo(
    () => {
      if (!isSuccess) return 0;

      return (
        formik.values.lines?.filter((item) => {
          const mxik = getRowMxik(item);
          return mxik && !item.productId && !knownMxiks.has(mxik);
        }).length ?? 0
      );
    },
    [formik.values.lines, isSuccess, knownMxiks],
  );

  const hasSelectedRows = useMemo(
    () => formik.values.lines.some((item) => Boolean(item.productId)),
    [formik.values.lines],
  );

  const handlePurchaseModeChange = useCallback(
    (value: PurchaseMode) => {
      formik.setValues(
        (currentValues) => ({
          ...currentValues,
          supplierAccountId: null,
          lines: currentValues.lines.map((line) => ({
            ...line,
            debitAccountId: null,
            debitAccountName: "",
            vatAccountId: null,
            vatAccountName: "",
          })),
        }),
        false,
      );
      setPurchaseMode(value);
      setProductWithCount(value === "services");
      if (!isEdit) {
        setPurchaseModeDraft(value);
        setProductWithCountDraft(value === "services");
      }
      setSelectBoxOptions(
        toSelectBoxOptions(
          getBaseColumnConfig(value === "services", withDiscount, t),
        ),
      );
    },
    [
      isEdit,
      formik,
      setProductWithCount,
      setProductWithCountDraft,
      setPurchaseMode,
      setPurchaseModeDraft,
      t,
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

    const ready = await ensureSavedBeforeConfirm();
    if (!ready) return;

    try {
      await confirmMutation.mutateAsync();
      toast.success(t("purchase.messages.confirmed"));
      navigate(-1);
    } catch (error) {
      errorHandlers(error);
    }
  }, [confirmMutation, ensureSavedBeforeConfirm, isDraft, navigate, purchaseId, t]);

  const handleCommentChange = useCallback(
    (value: string) => draftFormik.setFieldValue("comment", value, false),
    [draftFormik],
  );

  const handleCancelDocument = useCallback(async () => {
    if (!purchaseId || !isDraft) return;

    try {
      await cancelMutation.mutateAsync();
      toast.success(t("purchase.messages.cancelled"));
      navigate(-1);
    } catch (error) {
      errorHandlers(error);
    }
  }, [cancelMutation, isDraft, navigate, purchaseId, t]);

  if (
    isEdit &&
    (detailQuery.isLoading ||
      !detailData ||
      isDetailModeResolving ||
      !isDetailModeReady ||
      purchaseMode !== detailPurchaseMode)
  ) {
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
                  {t("purchase.fields.docNumber")}
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
                <PermissionCard permission={purchasePermissions.cancel}>
                  <Button
                    danger
                    icon={<CircleX className="size-4" />}
                    loading={cancelMutation.isPending}
                    disabled={!isDraft || isSubmitting}
                    onClick={() => void handleCancelDocument()}
                  >
                    {t("common.cancel")}
                  </Button>
                </PermissionCard>
                <PermissionCard permission={purchasePermissions.confirm}>
                  <Button
                    type="primary"
                    icon={<CheckCircle2 className="size-4" />}
                    loading={confirmMutation.isPending}
                    disabled={!isDraft || isSubmitting}
                    onClick={() => void handleConfirm()}
                  >
                    {t("common.confirm")}
                  </Button>
                </PermissionCard>
              </div>
            </div>
          </Card>
        )}

        <PurchaseImportHeader
          formik={draftFormik}
          purchaseMode={purchaseMode}
        />
        <PurchaseImportMxikActions
          missingMxikCount={missingMxikCount}
          isLoading={isLoading}
          isFetching={isFetching}
          linesLength={formik.values.lines.length}
          purchaseMode={purchaseMode}
          onDeleteMissingMxiks={handleDeleteMissingMxiks}
          onOpenMissingProductsModal={handleOpenMissingProductsModal}
        />
        <PurchaseProcessingModeModal
          open={processingModeModalOpen}
          loading={isCreateProcessing}
          canConfirm={canConfirm}
          onClose={() => setProcessingModeModalOpen(false)}
          onSelect={(mode) => void handleCreateSave(mode)}
        />
        <PurchaseImportLinesSection
          columns={tableColumns}
          comment={formik.values.comment}
          counterpartyId={formik.values.counterpartyId}
          height={height}
          isFetching={isFetching}
          isLoading={isLoading}
          lines={formik.values.lines}
          formik={draftFormik}
          hasSelectedRows={hasSelectedRows}
          onAddManualRow={handleAddManualRow}
          onBack={() => navigate(-1)}
          onSave={isEdit ? undefined : () => setProcessingModeModalOpen(true)}
          saveLoading={isCreateProcessing}
          onExcelDataChange={handleExcelDataChange}
          onClearExcelData={handleClearExcelData}
          onPurchaseModeChange={handlePurchaseModeChange}
          onCommentChange={handleCommentChange}
          purchaseMode={purchaseMode}
          selectBoxOptions={selectBoxOptions}
          setSelectBoxOptions={setSelectBoxOptions}
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
          purchaseMode={purchaseMode}
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
          onClose={closeProductsCreateModal}
          onCreated={() => {
            void refetchProducts();
          }}
        />
      </Form>
    </div>
  );
};

export default PurchaseEditor;
