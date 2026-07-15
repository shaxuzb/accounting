export const purchaseEndpoints = {
  purchase: {
    list: "purchase-docs",
    detail: (id: string | number) => `purchase-docs/${id}`,
    create: "purchase-docs",
    update: (id: string | number) => `purchase-docs/${id}`,
    confirm: (id: string | number) => `purchase-docs/${id}/confirm`,
    cancel: (id: string | number) => `purchase-docs/${id}/cancel`,
    // importTemplate: "goods-movements/purchase-import-template",
  },
} as const;

export const purchaseDocumentTypeIds = {
  goods: 1,
  services: 2,
} as const;

export const purchaseDocumentAccountChartAccountsPath = (
  purchaseMode: "goods" | "services",
) =>
  `document-account-settings/${purchaseDocumentTypeIds[purchaseMode]}/chart-accounts`;
