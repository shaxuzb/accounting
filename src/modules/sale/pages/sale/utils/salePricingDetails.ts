import type { SaleProductPriceLayer, SaleProductStock } from "../types/type";

export const COSTING_METHOD = {
  FIFO: 1,
  LIFO: 2,
  AVERAGE: 3,
} as const;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const read = (
  value: unknown,
  keys: string[],
  fallback: unknown = undefined,
) => {
  if (!isRecord(value)) return fallback;
  for (const key of keys) {
    const current = value[key];
    if (current !== undefined && current !== null && current !== "") {
      return current;
    }
  }
  return fallback;
};

export const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toStringValue = (value: unknown, fallback = "") =>
  value === undefined || value === null ? fallback : String(value);

const getCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  const collection = read(value, [
    "purchases",
    "salePrices",
    "items",
    "results",
    "data",
    "details",
    "tables",
    "productTables",
    "stocks",
    "batches",
    "rows",
  ]);
  return Array.isArray(collection) ? collection : [];
};

const getNumberArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map((item) => toNumber(item, 0)).filter(Boolean)
    : [];

const getProductFallback = (
  response: unknown,
  product: SaleProductStock,
  keys: string[],
  fallback: unknown = undefined,
) => read(response, keys, read(product, keys, fallback));

const getNestedFallback = (
  response: unknown,
  groupKey: string,
  keys: string[],
  fallback: unknown = undefined,
) => read(read(response, [groupKey]), keys, fallback);

const getLayerMatchKey = (item: unknown) => ({
  purchaseId: toNumber(read(item, ["purchaseId", "ownerId"]), 0),
  purchaseDate: toStringValue(
    read(item, ["purchaseDate", "date", "docDate"], ""),
  ),
  productTableIds: getNumberArray(read(item, ["productTableIds"])),
});

const hasProductTableOverlap = (left: number[], right: number[]) =>
  left.length > 0 && right.length > 0 && left.some((id) => right.includes(id));

const findSaleLayer = (costItem: unknown, saleItems: unknown[]) => {
  const costKey = getLayerMatchKey(costItem);
  return saleItems.find((saleItem) => {
    const saleKey = getLayerMatchKey(saleItem);
    if (costKey.purchaseId && saleKey.purchaseId === costKey.purchaseId)
      return true;
    if (
      hasProductTableOverlap(costKey.productTableIds, saleKey.productTableIds)
    )
      return true;
    return Boolean(
      costKey.purchaseDate && saleKey.purchaseDate === costKey.purchaseDate,
    );
  });
};

const getUnitIdFallback = (
  response: unknown,
  product: SaleProductStock,
  firstLayer?: unknown,
) =>
  read(
    response,
    ["unitId"],
    read(
      read(response, ["unit"]),
      ["id"],
      read(
        firstLayer,
        ["unitId"],
        read(
          read(firstLayer, ["unit"]),
          ["id"],
          read(product, ["unitId"], read(read(product, ["unit"]), ["id"])),
        ),
      ),
    ),
  );

const getUnitNameFallback = (
  response: unknown,
  product: SaleProductStock,
  firstLayer?: unknown,
) =>
  read(
    response,
    ["unitName"],
    read(
      read(response, ["unit"]),
      ["name"],
      read(
        firstLayer,
        ["unitName"],
        read(
          read(firstLayer, ["unit"]),
          ["name"],
          read(product, ["unitName"], read(read(product, ["unit"]), ["name"])),
        ),
      ),
    ),
  );

const normalizeLayer = (
  item: unknown,
  response: unknown,
  product: SaleProductStock,
  saleItem?: unknown,
): SaleProductPriceLayer => {
  const costPrice = toNumber(
    read(
      item,
      [
        "costPrice",
        "averageCostPrice",
        "unitCost",
        "cost",
        "purchasePrice",
        "unitPrice",
      ],
      getProductFallback(response, product, [
        "costPrice",
        "averageCostPrice",
        "unitCost",
        "cost",
        "unitPrice",
        "purchasePrice",
      ]),
    ),
  );
  const salePrice = toNumber(
    read(
      saleItem ?? item,
      ["salePrice", "sellingPrice", "priceForSale"],
      read(saleItem, ["unitPrice", "price"], costPrice),
    ),
    costPrice,
  );
  const productTableIds = getNumberArray(read(item, ["productTableIds"]));

  return {
    id: toNumber(read(item, ["id"]), 0) || null,
    purchaseId: toNumber(read(item, ["purchaseId", "ownerId"]), 0) || null,
    productTableId:
      toNumber(read(item, ["productTableId", "tableId", "stockTableId"]), 0) ||
      productTableIds[0] ||
      null,
    productTableIds,
    purchaseDocNumber: toStringValue(
      read(item, ["purchaseDocNumber", "docNumber", "documentNumber"], ""),
    ),
    purchaseDate: toStringValue(
      read(item, ["purchaseDate", "docDate", "date", "createdDate"], ""),
    ),
    warehouseName: toStringValue(
      read(item, ["warehouseName"], product.unitName ? "" : ""),
    ),
    availableQuantity: toNumber(
      read(item, [
        "availableQuantity",
        "remainingQuantity",
        "quantity",
        "qty",
        "balance",
      ]),
    ),
    writeOffQuantity: 0,
    costPrice,
    unitPrice: costPrice,
    salePrice,
  };
};

export const normalizeProductPriceDetails = (
  response: unknown,
  product: SaleProductStock,
) => {
  const cost = read(response, ["cost"]);
  const sale = read(response, ["sale"]);
  const costCollection = getCollection(cost);
  const saleCollection = getCollection(sale);
  const fallbackCollection = getCollection(response);
  const collection = costCollection.length
    ? costCollection
    : fallbackCollection;
  const layers = (
    collection.length ? collection : [isRecord(response) ? response : product]
  ).map((item) =>
    normalizeLayer(
      item,
      response,
      product,
      findSaleLayer(item, saleCollection),
    ),
  );
  const availableQuantity = layers.reduce(
    (sum, layer) => sum + layer.availableQuantity,
    0,
  );

  return {
    productId: toNumber(
      getProductFallback(response, product, ["productId", "id"]),
    ),
    productName: toStringValue(
      getProductFallback(response, product, ["productName", "name"]),
      "-",
    ),
    mxik: toStringValue(
      getProductFallback(response, product, ["mxik", "barcode"]),
    ),
    unitId: toNumber(getUnitIdFallback(response, product, collection[0]), 0),
    unitName: toStringValue(
      getUnitNameFallback(response, product, collection[0]),
    ),
    availableQuantity: toNumber(
      getProductFallback(response, product, [
        "availableQuantity",
        "remainingQuantity",
        "quantity",
        "qty",
      ]),
      availableQuantity,
    ),
    costPrice: toNumber(
      getNestedFallback(
        response,
        "cost",
        ["costPrice", "averageCostPrice", "unitCost", "cost", "unitPrice"],
        getProductFallback(response, product, [
          "costPrice",
          "averageCostPrice",
          "unitCost",
          "cost",
          "unitPrice",
          "purchasePrice",
        ]),
      ),
    ),
    salePrice: toNumber(
      getNestedFallback(
        response,
        "sale",
        ["salePrice", "price"],
        getProductFallback(response, product, ["salePrice", "price"]),
      ),
    ),
    layers,
  };
};

const sortLayers = (
  layers: SaleProductPriceLayer[],
  costingMethodId: number,
) => {
  if (costingMethodId === COSTING_METHOD.AVERAGE) return layers;
  // FIFO eski kirimlardan, LIFO esa oxirgi kirimlardan boshlab sarflaydi.
  const sorted = [...layers].sort((a, b) => {
    const left = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
    const right = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
    return left - right;
  });
  return costingMethodId === COSTING_METHOD.LIFO ? sorted.reverse() : sorted;
};

const weightedAverage = (
  layers: SaleProductPriceLayer[],
  selector: (layer: SaleProductPriceLayer) => number,
) => {
  const totalQuantity = layers.reduce(
    (sum, layer) => sum + layer.writeOffQuantity,
    0,
  );
  if (!totalQuantity) return 0;
  return (
    layers.reduce(
      (sum, layer) => sum + selector(layer) * layer.writeOffQuantity,
      0,
    ) / totalQuantity
  );
};

export const getMarkupPercent = (costPrice: number, salePrice: number) =>
  costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;

export const getSalePriceByMarkup = (
  costPrice: number,
  markupPercent: number,
) => costPrice * (1 + markupPercent / 100);

export const allocateSaleLayers = ({
  costingMethodId,
  quantity,
  layers,
}: {
  costingMethodId: number;
  quantity: number;
  layers: SaleProductPriceLayer[];
}) => {
  let remaining = quantity;
  // Tanlangan miqdorni costing metodiga mos qatlamlarga avtomatik taqsimlaymiz.
  return sortLayers(layers, costingMethodId)
    .map((layer) => {
      const writeOffQuantity = Math.min(layer.availableQuantity, remaining);
      remaining -= writeOffQuantity;
      return {
        ...layer,
        writeOffQuantity,
      };
    })
    .filter((layer) => layer.writeOffQuantity > 0);
};

export const getCostingPrices = ({
  costingMethodId,
  defaultCostPrice,
  defaultSalePrice,
  layers,
}: {
  costingMethodId: number;
  defaultCostPrice: number;
  defaultSalePrice: number;
  layers: SaleProductPriceLayer[];
}) => {
  // AVERAGE umumiy narxlarni oladi; FIFO/LIFO cost.purchases va sale.salePrices qatlamlarini o'rtachalaydi.
  if (costingMethodId === COSTING_METHOD.AVERAGE) {
    return {
      costPrice: defaultCostPrice,
      unitPrice: defaultSalePrice || defaultCostPrice,
    };
  }

  if (!layers.length) {
    return {
      costPrice: defaultCostPrice,
      unitPrice: defaultCostPrice,
    };
  }

  const averageUnitPrice = weightedAverage(layers, (layer) => layer.unitPrice);
  const averageSalePrice = weightedAverage(layers, (layer) => layer.salePrice);

  return {
    costPrice: averageUnitPrice,
    unitPrice:
      averageSalePrice ||
      defaultSalePrice ||
      averageUnitPrice ||
      defaultCostPrice,
  };
};
