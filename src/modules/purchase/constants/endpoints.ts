export const purchaseEndpoints = {
  purchase: {
    list: "goods-movements",
    detail: (id: string | number) => `goods-movements/${id}`,
    create: "goods-movements",
    update: (id: string | number) => `goods-movements/${id}`,
    importTemplate: "goods-movements/purchase-import-template",
  },
} as const;
