export const cashCollectionEndpoints = {
  list: "cash-collection-docs",
  inTransit: "cash-collection-docs/in-transit",
  detail: (id: string | number) => `cash-collection-docs/${id}`,
  create: "cash-collection-docs",
  update: (id: string | number) => `cash-collection-docs/${id}`,
  delete: (id: string | number) => `cash-collection-docs/${id}`,
  sendToBank: (id: string | number) =>
    `cash-collection-docs/${id}/send-to-bank`,
  cancel: (id: string | number) => `cash-collection-docs/${id}/cancel`,
} as const;
