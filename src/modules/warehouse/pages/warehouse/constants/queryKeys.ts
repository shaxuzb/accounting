export const WarehouseKeys = {
  warehouse: {
    all: ["product-stock"] as const,
    list: (params?: unknown) => ["product-stock", "list", params] as const,
    detail: (params?: unknown) => ["product-stock", "detail", params] as const,
    detailSerial: (params?: unknown) =>
      ["product-stock", "detail-serial", params] as const,
  },
} as const;
