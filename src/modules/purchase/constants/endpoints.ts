export const purchaseEndpoints = {
  purchase: {
    list: "purchase-docs",
    detail: (id: string | number) => `purchase-docs/${id}`,
    create: "purchase-docs",
    update: (id: string | number) => `purchase-docs/${id}`,
    // importTemplate: "goods-movements/purchase-import-template",
  },
} as const;
