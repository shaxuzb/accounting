export const saleEndpoints = {
  saleDoc: {
    list: "sale-docs",
    detail: (id: string | number) => `sale-docs/${id}`,
    create: "sale-docs",
    update: (id: string | number) => `sale-docs/${id}`,
    warehouseConfirm: (id: string | number) => `sale-docs/${id}/assembly`,
    confirm: (id: string | number) => `sale-docs/${id}/confirm`,
  },
  saleDocTable: {
    list: "sale-doc-tables",
  },
  productTable: {
    byMarking: "product-stocks/by-marking",
  },
  productStock: {
    products: "product-stocks/products",
  },
  productPrice: {
    detail: (productId: string | number) =>
      `product-prices/${productId}/details`,
  },
} as const;
