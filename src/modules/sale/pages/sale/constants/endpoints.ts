export const saleEndpoints = {
  saleDoc: {
    list: "sale-docs",
    detail: (id: string | number) => `sale-docs/${id}`,
    create: "sale-docs",
    update: (id: string | number) => `sale-docs/${id}`,
    confirm: (id: string | number) => `sale-docs/${id}/confirm`,
  },
  saleDocTable: {
    list: "sale-doc-tables",
  },
  productTable: {
    byMarking: "product-tables/by-marking",
  },
} as const;
