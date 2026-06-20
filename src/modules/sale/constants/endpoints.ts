export const saleEndpoints = {
  docs: {
    list: "sale-docs",
    detail: (id: string | number) => `sale-docs/${id}`,
    create: "sale-docs",
    update: (id: string | number) => `sale-docs/${id}`,
    confirm: (id: string | number) => `sale-docs/${id}/confirm`,
    delete: (id: string | number) => `sale-docs/${id}`,
  },
  tables: {
    list: "sale-doc-tables",
    detail: (id: string | number) => `sale-doc-tables/${id}`,
    create: "sale-doc-tables",
    update: (id: string | number) => `sale-doc-tables/${id}`,
    delete: (id: string | number) => `sale-doc-tables/${id}`,
  },
  lookup: {
    productByMarking: () =>
      `product-tables/by-marking`,
    prices: "product-prices",
  },
} as const;
