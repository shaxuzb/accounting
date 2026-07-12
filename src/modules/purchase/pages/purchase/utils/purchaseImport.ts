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
        serviceLines?: unknown[] | null;
        lines?: unknown[] | null;
      }
    | null
    | undefined,
  serviceProductIds?: Iterable<number | string> | null,
): PurchaseMode => {
  if (!detail) return "goods";
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
  key: Date.now() + indexId,
  id: 0,
  indexId,
  name: "",
  counterpartyId,
  product: "",
  productId: null,
  productName: "",
  sapCode: "",
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

export const getProductCode = (
  item?: ProductSelectOption | SelectOption | null,
) =>
  String(
    (item as ProductSelectOption | undefined)?.mxik ??
      (item as ProductSelectOption | undefined)?.code ??
      (item as ProductSelectOption | undefined)?.barcode ??
      "",
  );

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

export const toMarkingNumbers = (row?: PurchaseImportRow) => {
  if (!row) return [];
  if (Array.isArray(row.markingNumbers)) return row.markingNumbers;
  const marking = String(row.markingNumber ?? "").trim();
  return marking ? [marking] : [];
};

export const parseMarkingInput = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

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

export const toPurchaseCreatePayload = (
  values: PurchaseImportForm,
  completedRows: PurchaseImportRow[],
  purchaseMode: PurchaseMode,
): PurchaseCreatePayload => ({
  docDate: values.docDate,
  counterpartyId: values.counterpartyId ?? 0,
  warehouseId: values.warehouseId ?? 0,
  currencyId: values.currencyId ?? 0,
  contractId: values.contractId,
  supplierAccountId: values.supplierAccountId ?? 0,
  comment: values.comment || null,
  lines: completedRows.map((item) => {
    const markingNumbers = toMarkingNumbers(item);
    const hasMarking =
      purchaseMode === "goods" &&
      item.isPieceTracked &&
      markingNumbers.length > 0;
    const quantity = item.isPieceTracked
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
