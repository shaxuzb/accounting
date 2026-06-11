export const purchaseKeys = {
  purchase: {
    all: ["purchase", "purchase"] as const,
    list: (params?: unknown) => ["purchase", "purchase", "list", params] as const,
    detail: (id: string | number) => ["purchase", "purchase", "detail", id] as const,
  },
  /* modux:querykeys */
};
