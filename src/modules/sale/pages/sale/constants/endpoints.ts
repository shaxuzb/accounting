export const saleEndpoints = {
  saleDoc: {
    list: "sale-docs",
    detail: (id: string | number) => `sale-docs/${id}`,
    create: "sale-docs",
    update: (id: string | number) => `sale-docs/${id}`,
    warehouseConfirm: (id: string | number) => `sale-docs/${id}/assembly`,
    availableProducts: (id: string | number) =>
      `sale-docs/${id}/available-products`,
    availableProductsByWarehouse: "sale-docs/available-products",
    confirm: (id: string | number) => `sale-docs/${id}/confirm`,
    cancel: (id: string | number) => `sale-docs/${id}/cancel`,
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
