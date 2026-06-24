export const saleKeys = {
  all: ["sale"] as const,
  saleDoc: {
    all: ["sale", "docs"] as const,
    list: (params?: unknown) => ["sale", "docs", "list", params] as const,
    detail: (id: string | number) => ["sale", "docs", "detail", id] as const,
  },
  saleDocTable: {
    all: ["sale", "tables"] as const,
    list: (ownerId: string | number) =>
      ["sale", "tables", "list", ownerId] as const,
  },
  productStock: {
    all: ["sale", "product-stock"] as const,
    products: (params?: unknown) =>
      ["sale", "product-stock", "products", params] as const,
  },
} as const;
