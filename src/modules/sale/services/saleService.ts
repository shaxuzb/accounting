import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { saleEndpoints } from "../constants/endpoints";
import type {
  SaleDoc,
  SaleDocConfirmForm,
  SaleDocForm,
  SaleDocListParams,
  SaleDocTable,
  SaleDocTableForm,
  SaleDocUpdateForm,
} from "../types/type";

type UnknownRecord = Record<string, unknown>;
type SaleListQuery = SaleDocListParams | URLSearchParams;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const read = <T>(record: UnknownRecord, keys: string[], fallback: T): T => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return fallback;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const unwrap = (value: unknown) => {
  const root = toRecord(value);
  return toRecord(read(root, ["data", "result"], root));
};

const collection = (value: unknown) => {
  if (Array.isArray(value)) return value;
  const data = unwrap(value);
  const items = read<unknown[]>(data, ["items", "results", "rows"], []);
  return Array.isArray(items) ? items : [];
};

export const normalizeSaleDoc = (value: unknown): SaleDoc => {
  const item = unwrap(value);
  const rawLines = read<unknown[]>(
    item,
    ["lines", "saleDocTables", "tables"],
    [],
  );
  return {
    id: toNumber(read(item, ["id"], 0)),
    docNumber: String(read(item, ["docNumber", "documentNumber"], "")),
    docDate: String(read(item, ["docDate", "date"], "")),
    counterpartyId: toNumber(read(item, ["counterpartyId"], 0)),
    counterpartyName: String(read(item, ["counterpartyName"], "")),
    warehouseId: toNumber(read(item, ["warehouseId"], 0)),
    warehouseName: String(read(item, ["warehouseName"], "")),
    currencyId: toNumber(read(item, ["currencyId"], 0)),
    currencyCode: String(
      read(item, ["currencyCode", "currency", "currencyName"], ""),
    ),
    comment: String(read(item, ["comment"], "")) || undefined,
    stateId: toNumber(read(item, ["stateId"], 0)) || undefined,
    stateName: String(read(item, ["stateName"], "")) || undefined,
    statusId: toNumber(read(item, ["statusId"], 0)) || undefined,
    statusName: String(read(item, ["statusName"], "")) || undefined,
    totalAmount: toNumber(read(item, ["totalAmount", "finalAmount"], 0)),
    createdDate: String(read(item, ["createdDate"], "")) || undefined,
     lines: Array.isArray(rawLines)
      ? rawLines.map(normalizeSaleDocTable)
      : [],
  };
};

export const normalizeSaleDocTable = (value: unknown): SaleDocTable => {
  const item = unwrap(value);
  const productTable = toRecord(read(item, ["productTable"], {}));
  const product = toRecord(read(item, ["product"], {}));
  const quantity = toNumber(read(item, ["quantity", "qty"], 0));
  const price = toNumber(read(item, ["price"], 0));
  const costPrice = toNumber(read(item, ["costPrice"], price));
  const amount = toNumber(read(item, ["amount"], price));
   const markingNumber = String(
    read(item, ["markingNumber", "marking"], ""),
  );
  return {
    id: toNumber(read(item, ["id"], 0)),
    ownerId: toNumber(read(item, ["ownerId"], 0)),
    productTableId: toNumber(read(item, ["productTableId"], 0)),
    productId:
      toNumber(read(item, ["productId"], 0)) ||
      toNumber(read(productTable, ["productId"], 0)) ||
      toNumber(read(product, ["id", "productId"], 0)) ||
      undefined,
    productName: String(
      read(
        item,
        ["productName", "name"],
        read(
          productTable,
          ["productName", "name"],
          read(product, ["name", "productName"], ""),
        ),
      ),
    ),
    barcode:
      markingNumber || 
      String(read(item, ["barcode", "sapCode", "code"], "")),
    markingNumber: markingNumber || undefined,
    serialNumber: String(read(item, ["serialNumber"], "")) || undefined,
    unitName: String(read(item, ["unitName", "unit"], "")) || undefined,
    quantity,
    price,
    costPrice,
    amount,
    vatRateId: toNumber(read(item, ["vatRateId"], 0)) || null,
    vatRateName: String(read(item, ["vatRateName"], "")) || undefined,
    vatAmount: toNumber(read(item, ["vatAmount"], 0)),
    availableQuantity:
      read(item, ["availableQuantity", "balance", "remainder"], undefined) ===
      undefined
        ? undefined
        : toNumber(
            read(item, ["availableQuantity", "balance", "remainder"], 0),
          ),
    totalAmount: toNumber(
      read(item, ["totalAmount"], quantity * amount),
    ),
    syncStatus: "confirmed",
  };
};

export const saleService = {
  list: async (params?: SaleListQuery): Promise<Paginated<SaleDoc>> => {
    const { data } = await $axiosPrivate.get(saleEndpoints.docs.list, { params });
    const root = unwrap(data);
    const items = collection(data).map(normalizeSaleDoc);
    return {
      items,
     total: toNumber(read(root, ["total", "count", "totalCount"], items.length)),
      page: toNumber(read(root, ["page"], 1)),
      pageSize: toNumber(read(root, ["pageSize"], items.length)),
    };
  },
  detail: async (id: string | number) => {
    const { data } = await $axiosPrivate.get(saleEndpoints.docs.detail(id));
    return normalizeSaleDoc(data);
  },
  create: async (payload: SaleDocForm) => {
    const { data } = await $axiosPrivate.post(saleEndpoints.docs.create, {
      counterpartyId: payload.counterpartyId,
      warehouseId: payload.warehouseId,
      currencyId: payload.currencyId,
      comment: payload.comment,
      lines: payload.lines,
    });
    return normalizeSaleDoc(data);
  },
  update: async (id: string | number, payload: SaleDocUpdateForm) => {
    const { data } = await $axiosPrivate.put(
      saleEndpoints.docs.update(id),
      payload,
    );
    return normalizeSaleDoc(data);
  },
  confirm: async (id: string | number, payload: SaleDocConfirmForm) => {
    const { data } = await $axiosPrivate.put(
      saleEndpoints.docs.confirm(id),
      payload,
    );
    return data;
  },
  delete: (id: string | number) =>
    $axiosPrivate.delete(saleEndpoints.docs.delete(id)),
  lines: async (ownerId: string | number): Promise<Paginated<SaleDocTable>> => {
    const { data } = await $axiosPrivate.get(saleEndpoints.tables.list, {
      params: { OwnerId: ownerId, Page: 1, PageSize: 1000 },
    });
    return data;
  },
  createLine: async (payload: SaleDocTableForm) => {
    const { data } = await $axiosPrivate.post(
      saleEndpoints.tables.create,
      payload,
    );
    return normalizeSaleDocTable(data);
  },
  updateLine: async (id: string | number, payload: SaleDocTableForm) => {
    const { data } = await $axiosPrivate.put(
      saleEndpoints.tables.update(id),
      payload,
    );
    return normalizeSaleDocTable(data);
  },
  deleteLine: (id: string | number) =>
    $axiosPrivate.delete(saleEndpoints.tables.delete(id)),
};
