import { $axiosPrivate } from "@/services/AxiosService";
import { saleEndpoints } from "../constants/endpoints";
import type { SaleProductLookup } from "../types/type";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const unwrap = (value: unknown) => {
  const root = toRecord(value);
  return toRecord(root.data ?? root.result ?? root);
};

const getItems = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const data = unwrap(value);
  const items = data.items ?? data.results ?? data.rows;
  return Array.isArray(items) ? items : [];
};

const numberValue = (record: UnknownRecord, keys: string[], fallback = 0) => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      const parsed = Number(record[key]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
};

const stringValue = (record: UnknownRecord, keys: string[]) => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return String(record[key]);
    }
  }
  return "";
};

export const saleProductLookupService = {
  byMarking: async (markingNumber: string): Promise<SaleProductLookup | null> => {
    const normalizedMarking = markingNumber.trim();
    const { data } = await $axiosPrivate.get(
      saleEndpoints.lookup.productByMarking(normalizedMarking),
    );
    const productTable = unwrap(data);

    if (!Object.keys(productTable).length) return null;

    const product = toRecord(productTable.product ?? productTable.productDto);
    const productTableId = numberValue(productTable, ["id", "productTableId"]);
    const productId =
      numberValue(productTable, ["productId"]) ||
      numberValue(product, ["id", "productId"]);

    if (!productTableId || !productId) return null;

    const priceResponse = await $axiosPrivate
      .get(saleEndpoints.lookup.prices, {
        params: { ProductId: productId, Page: 1, PageSize: 20 },
      })
      .then((response) => getItems(response.data))
      .catch(() => [] as unknown[]);
    const priceRecord = toRecord(priceResponse[0]);

    return {
      productId,
      productTableId,
      barcode:
        stringValue(productTable, ["markingNumber", "barcode"]) ||
        normalizedMarking,
      serialNumber:
        stringValue(productTable, ["serialNumber"]) || undefined,
      productName:
        stringValue(productTable, ["productName", "name"]) ||
        stringValue(product, ["name", "productName"]),
      unitName:
        stringValue(productTable, ["unitName", "unit"]) ||
        stringValue(product, ["unitName", "unit"]),
      price:
        numberValue(productTable, ["salePrice", "price"]) ||
        numberValue(priceRecord, ["price", "salePrice"]),
      availableQuantity: 1,
      currencyId: numberValue(priceRecord, ["currencyId"]) || undefined,
      vatRateId:
        numberValue(productTable, ["vatRateId"]) ||
        numberValue(product, ["vatRateId"]) ||
        null,
    };
  },
};
