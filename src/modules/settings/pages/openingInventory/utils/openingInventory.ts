import dayjs from "dayjs";
import { formatDate } from "@/utils/helpers";
import type {
  ProductListResponse,
  ProductSelectOption,
  OpeningInventoryRow,
  OpeningInventoryMode,
  SelectOption,
} from "../types/type";
import type {
  OpeningInventoryForm,
  OpeningInventoryPayload,
} from "../types/form";
import { isCompleteOpeningInventoryLine } from "../types/schema";

export const getDefaultOpeningInventoryHeader = (): Omit<OpeningInventoryForm, "lines"> => ({
  docDate: dayjs().format(formatDate),
  counterpartyId: null,
  currencyId: 1,
  contractId: null,
  warehouseId: null,
  comment: "",
});

let rowKeySequence = 0;

const createRowKey = () => {
  rowKeySequence = (rowKeySequence + 1) % 1000;
  return Date.now() * 1000 + rowKeySequence;
};

export const ensureStableRowKeys = (
  rows: OpeningInventoryRow[],
): OpeningInventoryRow[] => {
  const usedKeys = new Set<number>();
  let changed = false;

  const normalizedRows = rows.map((row, index) => {
    const candidateKey = Number(row.key);
    const hasStableKey =
      Number.isSafeInteger(candidateKey) &&
      candidateKey > 0 &&
      !usedKeys.has(candidateKey);
    const key = hasStableKey ? candidateKey : createRowKey();
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
  row?: Pick<OpeningInventoryRow, "mxik"> | null,
) => String(row?.mxik ?? "").trim();

export const getProductPrice = (item?: ProductSelectOption | null) =>
  Number(item?.purchasePrice ?? item?.pricePerUom ?? item?.price ?? 0);

export const getRowUnitLabel = (row: OpeningInventoryRow) =>
  row.unitCode ?? row.unitName ?? "";

export const getRowUnitPrice = (row: OpeningInventoryRow) =>
  getNumber(row.price || row.pricePerUom);

export const getRowAmount = (row: OpeningInventoryRow) =>
  getNumber(row.qty) * getRowUnitPrice(row);

export const getRowVatAmount = (
  row: OpeningInventoryRow,
  options: SelectOption[],
) => (getRowAmount(row) * getVatPercent(row.vatRateId, options)) / 100;

export const getOpeningInventoryTotals = (
  rows: OpeningInventoryRow[],
  vatRateOptions: SelectOption[],
) =>
  rows.reduce(
    (acc, row) => {
      if (!isCompleteOpeningInventoryLine(row)) return acc;
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

/** Marking codes may contain `,`, `;` or spaces, so only the line breaks and tabs of an Excel paste split them. */
export const parseMarkingInput = (value: string) =>
  value
    .split(/[\r\n\t]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const toMarkingNumbers = (row?: OpeningInventoryRow) => {
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
    OpeningInventoryRow,
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
  rows: OpeningInventoryRow[],
  mode: OpeningInventoryMode,
) =>
  rows.find(
    (item) =>
      mode === "goods" &&
      item.isPieceTracked &&
      toMarkingNumbers(item).length === 0,
  );

export const getDuplicateMarkingNumber = (rows: OpeningInventoryRow[]) => {
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

export const createEmptyRow = ({
  indexId,
  counterpartyId,
  mode,
}: {
  indexId: number;
  counterpartyId: number | null;
  mode: OpeningInventoryMode;
}): OpeningInventoryRow => ({
  key: createRowKey(),
  id: 0,
  indexId,
  name: "",
  counterpartyId,
  product: "",
  productId: null,
  productName: "",
  qty: null,
  serialNumber: "",
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
  debitAccountName: "",
  isPieceTracked: false,
  isService: mode === "services",
});

export const isEmptyOpeningInventoryRow = (row: OpeningInventoryRow) =>
  !row.productId &&
  !row.productName.trim() &&
  !row.product.trim() &&
  !row.mxik.trim() &&
  !row.qty &&
  !row.price &&
  !toMarkingNumbers(row).length;

const toDocumentPayload = (
  values: OpeningInventoryForm,
  completedRows: OpeningInventoryRow[],
  mode: OpeningInventoryMode,
): OpeningInventoryPayload => {
  const lines = completedRows.map((item) => {
    const markingNumbers = toMarkingNumbers(item);
    const hasMarking = mode === "goods" && markingNumbers.length > 0;
    // A marked line counts its codes; an unmarked one (stock bought before marking
    // was mandatory) is entered by quantity.
    const quantity = hasMarking
      ? markingNumbers.length
      : Number(item.qty ?? 1);
    const unitPrice = getRowUnitPrice(item);

    const line = {
      productId: Number(item.productId),
      quantity,
      unitId: Number(item.unitId),
      unitPrice,
      amount: quantity * unitPrice,
      debitAccountId: Number(item.debitAccountId ?? 0),
    };

    if (!hasMarking) return line;

    return {
      ...line,
      items: markingNumbers.map((markingNumber) => ({
        markingNumber,
        serialNumber: null,
      })),
    };
  });

  return {
    docDate: values.docDate,
    counterpartyId: values.counterpartyId ?? 0,
    contractId: values.contractId,
    warehouseId: values.warehouseId ?? 0,
    totalAmount: lines.reduce((total, line) => total + line.amount, 0),
    comment: values.comment || null,
    lines,
  };
};

export const toCreatePayload = (
  values: OpeningInventoryForm,
  completedRows: OpeningInventoryRow[],
  mode: OpeningInventoryMode,
): OpeningInventoryPayload =>
  toDocumentPayload(values, completedRows, mode);

export const toUpdatePayload = (
  values: OpeningInventoryForm,
  completedRows: OpeningInventoryRow[],
  mode: OpeningInventoryMode,
): OpeningInventoryPayload =>
  toDocumentPayload(values, completedRows, mode);

export const mapDetailLinesToRows = (
  lines: {
    id?: number;
    productId?: number;
    productName?: string;
    quantity?: number;
    unitId?: number;
    unitPrice?: number;
    price?: number;
    vatRateId?: number | null;
    debitAccountId?: number | null;
    debitAccountName?: string;
    items?: { markingNumber?: string | null; serialNumber?: string | null }[];
  }[],
  counterpartyId: number | null,
  mode: OpeningInventoryMode,
): OpeningInventoryRow[] =>
  (lines ?? []).map((line, index) => {
    const markings = (line.items ?? [])
      .map((item) => item.markingNumber?.trim())
      .filter(Boolean) as string[];

    return {
      key: createRowKey(),
      id: line.id ?? 0,
      indexId: index + 1,
      counterpartyId,
      product: line.productName ?? "",
      productId: line.productId ?? null,
      productName: line.productName ?? "",
      qty: line.quantity ?? null,
      serialNumber: "",
      markingNumber: markings.join("\n"),
      markingNumbers: markings,
      mxik: "",
      price: line.unitPrice ?? line.price ?? null,
      pricePerUom: line.unitPrice ?? line.price ?? null,
      unitId: line.unitId ?? null,
      unitCode: null,
      unitName: null,
      vatRateId: line.vatRateId ?? null,
      vatRates: null,
      debitAccountId: line.debitAccountId ?? null,
      debitAccountName: line.debitAccountName ?? "",
      isPieceTracked: mode === "goods" && markings.length > 0,
      isService: mode === "services",
    };
  });

export const getOpeningInventoryModeFromDetail = (
  detail:
    | {
        isService?: boolean | null;
        openingInventoryMode?: OpeningInventoryMode | null;
        serviceLines?: unknown[] | null;
        lines?: unknown[] | null;
      }
    | null
    | undefined,
): OpeningInventoryMode => {
  if (!detail) return "goods";
  if (
    detail.openingInventoryMode === "goods" ||
    detail.openingInventoryMode === "services"
  ) {
    return detail.openingInventoryMode;
  }
  if (typeof detail.isService === "boolean") {
    return detail.isService ? "services" : "goods";
  }
  if (detail.serviceLines?.length) return "services";

  const hasServiceLine = (line: unknown) => {
    if (!line || typeof line !== "object") return false;
    const record = line as Record<string, unknown>;
    return (
      "serviceId" in record ||
      "serviceName" in record ||
      "accountId" in record ||
      "expenseAccountName" in record
    );
  };

  return detail.lines?.some(hasServiceLine) ? "services" : "goods";
};
