import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { saleEndpoints } from "../pages/sale/constants/endpoints";
import type {
  SaleDocConfirmForm,
  SaleDocCreateForm,
  SaleDocTableUpdateForm,
  SaleDocUpdateForm,
} from "../pages/sale/types/form";
import type {
  SaleDoc,
  SaleDocTable,
} from "../pages/sale/types/type";

type UnknownRecord = Record<string, unknown>;
type SaleListQuery = ListParams | URLSearchParams;

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
    customerAccountId: toNumber(read(item, ["customerAccountId"], 0)) || null,
    vatAccountId: toNumber(read(item, ["vatAccountId"], 0)) || null,
    comment: String(read(item, ["comment"], "")) || undefined,
    priceIncludesVat: Boolean(read(item, ["priceIncludesVat"], false)),
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
    markingNumber: markingNumber || undefined,
    serialNumber: String(read(item, ["serialNumber"], "")) || undefined,
    unitName: String(read(item, ["unitName", "unit"], "")) || undefined,
    quantity,
    price,
    costPrice,
    amount,
    vatRateId: toNumber(read(item, ["vatRateId"], 0)) || null,
    inventoryAccountId:
      toNumber(read(item, ["inventoryAccountId"], 0)) || null,
    incomeAccountId: toNumber(read(item, ["incomeAccountId"], 0)) || null,
    costAccountId: toNumber(read(item, ["costAccountId"], 0)) || null,
    inventoryAccountName: String(
      read(item, ["inventoryAccountName"], ""),
    ) || undefined,
    incomeAccountName: String(read(item, ["incomeAccountName"], "")) || undefined,
    costAccountName: String(read(item, ["costAccountName"], "")) || undefined,
    vatRateName: String(read(item, ["vatRateName"], "")) || undefined,
    vatAmount: toNumber(read(item, ["vatAmount"], 0)),
    totalAmount: toNumber(
      read(item, ["totalAmount"], quantity * amount),
    ),
  };
};

export const saleService = {
  list: async (params?: SaleListQuery): Promise<Paginated<SaleDoc>> => {
    const { data } = await $axiosPrivate.get(saleEndpoints.saleDoc.list, {
      params,
    });
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
    const { data } = await $axiosPrivate.get(saleEndpoints.saleDoc.detail(id));
    return normalizeSaleDoc(data);
  },
  create: async (payload: SaleDocCreateForm) => {
    const { data } = await $axiosPrivate.post(
      saleEndpoints.saleDoc.create,
      payload,
    );
    return normalizeSaleDoc(data);
  },
  update: async (id: string | number, payload: SaleDocUpdateForm) => {
    const { data } = await $axiosPrivate.put(
      saleEndpoints.saleDoc.update(id),
      payload,
    );
    return normalizeSaleDoc(data);
  },
  confirm: async (id: string | number, payload: SaleDocConfirmForm) => {
    const { data } = await $axiosPrivate.put(
      saleEndpoints.saleDoc.confirm(id),
      payload,
    );
    return data;
  },
  delete: (id: string | number) =>
    $axiosPrivate.delete(saleEndpoints.saleDoc.detail(id)),
  lines: async (ownerId: string | number): Promise<Paginated<SaleDocTable>> => {
    const { data } = await $axiosPrivate.get(saleEndpoints.saleDocTable.list, {
      params: { OwnerId: ownerId, Page: 1, PageSize: 1000 },
    });
    return data;
  },
  createLine: async (payload: SaleDocTableUpdateForm) => {
    const { data } = await $axiosPrivate.post(
      saleEndpoints.saleDocTable.list,
      payload,
    );
    return normalizeSaleDocTable(data);
  },
  updateLine: async (id: string | number, payload: SaleDocTableUpdateForm) => {
    const { data } = await $axiosPrivate.put(
      `${saleEndpoints.saleDocTable.list}/${id}`,
      payload,
    );
    return normalizeSaleDocTable(data);
  },
  deleteLine: (id: string | number) =>
    $axiosPrivate.delete(`${saleEndpoints.saleDocTable.list}/${id}`),
};
