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
    comment: "",
  });

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
