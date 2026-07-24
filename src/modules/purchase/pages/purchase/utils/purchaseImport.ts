import dayjs from "dayjs";
import { formatDate } from "@/utils/helpers";
import type {
  ProductListResponse,
  ProductSelectOption,
  PurchaseImportRow,
  PurchaseMode,
  SelectOption,
} from "../types/type";
import type {
  PurchaseCreatePayload,
  PurchaseImportForm,
  PurchaseImportHeaderDraft,
  PurchaseProcessingMode,
  PurchaseUpdatePayload,
} from "../types/form";
import { isCompletePurchaseLine } from "../types/schema";

export const getDefaultPurchaseImportHeader =
  (): PurchaseImportHeaderDraft => ({
    docDate: dayjs().format(formatDate),
    counterpartyId: null,
    contractId: null,
    currencyId: 1,
    warehouseId: null,
    supplierAccountId: null,
    comment: "",
  });

let purchaseRowKeySequence = 0;

const createPurchaseRowKey = () => {
  purchaseRowKeySequence = (purchaseRowKeySequence + 1) % 1000;
  return Date.now() * 1000 + purchaseRowKeySequence;
};

export const ensureStablePurchaseRowKeys = (
  rows: PurchaseImportRow[],
): PurchaseImportRow[] => {
  const usedKeys = new Set<number>();
  let changed = false;

  const normalizedRows = rows.map((row, index) => {
    const candidateKey = Number(row.key);
    const hasStableKey =
      Number.isSafeInteger(candidateKey) &&
      candidateKey > 0 &&
      !usedKeys.has(candidateKey);
    const key = hasStableKey ? candidateKey : createPurchaseRowKey();
    const indexId = index + 1;

    usedKeys.add(key);

    if (row.key === key && row.indexId === indexId) {
      return row;
    }

    changed = true;
    return { ...row, key, indexId };
  });

  return changed ? normalizedRows : rows;
};

const hasPositiveNumericValue = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0;
};

const hasGoodsSignature = (line: Record<string, unknown>) =>
  hasPositiveNumericValue(line.productId) ||
  hasPositiveNumericValue(line.unitId);

export const isServiceDetailLine = (line: unknown): line is Record<string, unknown> => {
  if (!line || typeof line !== "object") return false;

  const record = line as Record<string, unknown>;

  if (
    "serviceName" in record ||
    "serviceId" in record ||
    "accountId" in record ||
    "expenseAccountName" in record ||
    "accountName" in record ||
    "name" in record
  ) {
    return true;
  }

  return "ownerId" in record && !hasGoodsSignature(record);
};

export const getPurchaseModeFromDetail = (
  detail:
    | {
        isService?: boolean | null;
        purchaseMode?: PurchaseMode | null;
        serviceLines?: unknown[] | null;
        lines?: unknown[] | null;
      }
    | null
    | undefined,
  serviceProductIds?: Iterable<number | string> | null,
): PurchaseMode => {
  if (!detail) return "goods";
  if (detail.purchaseMode === "goods" || detail.purchaseMode === "services") {
    return detail.purchaseMode;
  }
  if (typeof detail.isService === "boolean") {
    return detail.isService ? "services" : "goods";
  }
  if (detail.serviceLines?.length) return "services";

  const serviceLineIds = new Set(
    Array.from(serviceProductIds ?? []).map((id) => Number(id)),
  );

  const hasServiceId = (line: unknown): boolean => {
    if (!line || typeof line !== "object") return false;
    const record = line as Record<string, unknown>;

    if (
      isServiceDetailLine(record) ||
      "accountId" in record ||
      "expenseAccountName" in record
    ) {
      return true;
    }

    const candidateLineIds = [
      record["serviceId"],
      record["productId"],
      record["productTableId"],
    ].filter((value) => Number.isFinite(Number(value)));

    return candidateLineIds.some((value) => {
      const numeric = Number(value);
      return serviceLineIds.has(numeric);
    });
  };

  if (detail.lines?.some(hasServiceId)) return "services";

  return "goods";
};

export const createEmptyPurchaseRow = ({
  indexId,
  counterpartyId,
  currencyId,
  purchaseMode,
  productWithCount,
}: {
  indexId: number;
  counterpartyId: number | null;
  currencyId: number | null;
  purchaseMode: PurchaseMode;
  productWithCount: boolean;
}): PurchaseImportRow => ({
  key: createPurchaseRowKey(),
  id: 0,
  indexId,
  name: "",
  counterpartyId,
  product: "",
  productId: null,
  productName: "",
  qty: null,
  serialNumber: "",
  currencyId: currencyId ?? 1,
  currency: "",
  markingNumber: "",
  markingNumbers: [],
  mxik: "",
  price: null,
  pricePerUom: null,
  unitId: null,
  unitCode: null,
  unitName: null,
  vatRateId: null,
  vatRates: null,
  debitAccountId: null,
  vatAccountId: null,
  debitAccountName: "",
  vatAccountName: "",
  isSerial: purchaseMode === "goods" && !productWithCount,
  isPieceTracked: false,
});

export const getNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const getVatPercent = (vatRateId: unknown, options: SelectOption[]) => {
  const option = options.find((item) => item.id === Number(vatRateId));
  const match = String(option?.name ?? "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
};

export const getProductMxik = (
  item?: ProductSelectOption | SelectOption | null,
) => String((item as ProductSelectOption | undefined)?.mxik ?? "").trim();

export const getRowMxik = (
  row?: Pick<PurchaseImportRow, "mxik" | "sapCode"> | null,
) => {
  const mxik = String(row?.mxik ?? "").trim();
  if (mxik) return mxik;

  // Oldingi versiyada saqlangan local draftlar uchun bir martalik fallback.
  return String(row?.sapCode ?? "").trim();
};

export const getProductPrice = (item?: ProductSelectOption | null) =>
  Number(item?.purchasePrice ?? item?.pricePerUom ?? item?.price ?? 0);

export const getRowUnitLabel = (row: PurchaseImportRow) =>
  row.unitCode ?? row.unitName ?? "";

export const getRowUnitPrice = (row: PurchaseImportRow) =>
  getNumber(row.price || row.pricePerUom);

export const getRowAmount = (row: PurchaseImportRow) =>
  getNumber(row.qty) * getRowUnitPrice(row);

export const getRowVatAmount = (
  row: PurchaseImportRow,
  options: SelectOption[],
) => (getRowAmount(row) * getVatPercent(row.vatRateId, options)) / 100;

export const getPurchaseImportTotals = (
  rows: PurchaseImportRow[],
  vatRateOptions: SelectOption[],
) =>
  rows.reduce(
    (acc, row) => {
      if (!isCompletePurchaseLine(row)) return acc;
      const amount = getRowAmount(row);
      const vatAmount = getRowVatAmount(row, vatRateOptions);
      return {
        amount: acc.amount + amount,
        vatAmount: acc.vatAmount + vatAmount,
        totalAmount: acc.totalAmount + amount + vatAmount,
      };
    },
    {
      amount: 0,
      vatAmount: 0,
      totalAmount: 0,
    },
  );

export const parseMarkingInput = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const toMarkingNumbers = (row?: PurchaseImportRow) => {
  if (!row) return [];
  if (Array.isArray(row.markingNumbers)) {
    const markingNumbers = row.markingNumbers
      .map((item) => item.trim())
      .filter(Boolean);
    if (markingNumbers.length) return markingNumbers;
  }
  return parseMarkingInput(String(row.markingNumber ?? ""));
};

export const buildMarkingQuantityPatch = (markingNumbers: string[]) => {
  const normalizedMarkingNumbers = markingNumbers
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    markingNumber: normalizedMarkingNumbers.join("\n"),
    markingNumbers: normalizedMarkingNumbers,
    qty: normalizedMarkingNumbers.length,
  } satisfies Pick<
    PurchaseImportRow,
    "markingNumber" | "markingNumbers" | "qty"
  >;
};

export const normalizeProductOptions = (
  response: ProductSelectOption[] | ProductListResponse | null | undefined,
) => {
  if (Array.isArray(response)) return response;
  return response?.items ?? response?.results ?? response?.data ?? [];
};

export const getUnmarkedPieceTrackedRow = (
  rows: PurchaseImportRow[],
  purchaseMode: PurchaseMode,
) =>
  rows.find(
    (item) =>
      purchaseMode === "goods" &&
      item.isPieceTracked &&
      toMarkingNumbers(item).length === 0,
  );

export const getDuplicateMarkingNumber = (rows: PurchaseImportRow[]) => {
  const seen = new Set<string>();

  for (const row of rows) {
    for (const markingNumber of toMarkingNumbers(row)) {
      const normalizedMarkingNumber = markingNumber.trim();
      if (!normalizedMarkingNumber) continue;
      if (seen.has(normalizedMarkingNumber)) {
        return normalizedMarkingNumber;
      }
      seen.add(normalizedMarkingNumber);
    }
  }

  return null;
};

const toPurchaseDocumentPayload = (
  values: PurchaseImportForm,
  completedRows: PurchaseImportRow[],
  purchaseMode: PurchaseMode,
): PurchaseUpdatePayload => ({
  docDate: values.docDate,
  counterpartyId: values.counterpartyId ?? 0,
  warehouseId: values.warehouseId ?? 0,
  currencyId: values.currencyId ?? 0,
  contractId: values.contractId,
  supplierAccountId: values.supplierAccountId ?? 0,
  comment: values.comment || null,
  lines: completedRows.map((item) => {
    const markingNumbers = toMarkingNumbers(item);
    const hasMarking = purchaseMode === "goods" && markingNumbers.length > 0;
    const quantity = hasMarking || item.isPieceTracked
      ? markingNumbers.length
      : Number(item.qty ?? 1);

    const line = {
      productId: Number(item.productId),
      quantity,
      unitId: Number(item.unitId),
      unitPrice: getRowUnitPrice(item),
      vatRateId: item.vatRateId ?? null,
      debitAccountId: Number(item.debitAccountId ?? 0),
      vatAccountId: Number(item.vatAccountId ?? 0),
    };

    if (!hasMarking) return line;

    return {
      ...line,
      items: markingNumbers.map((markingNumber) => ({
        markingNumber,
        serialNumber: null,
      })),
    };
  }),
});

export const toPurchaseCreatePayload = (
  values: PurchaseImportForm,
  completedRows: PurchaseImportRow[],
  purchaseMode: PurchaseMode,
  processingMode: PurchaseProcessingMode,
): PurchaseCreatePayload => ({
  ...toPurchaseDocumentPayload(values, completedRows, purchaseMode),
  processingMode,
});

export const toPurchaseUpdatePayload = (
  values: PurchaseImportForm,
  completedRows: PurchaseImportRow[],
  purchaseMode: PurchaseMode,
): PurchaseUpdatePayload =>
  toPurchaseDocumentPayload(values, completedRows, purchaseMode);
