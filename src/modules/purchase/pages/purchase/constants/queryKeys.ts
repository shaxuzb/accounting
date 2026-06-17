export const purchaseKeys = {
  purchase: {
    all: ["purchase"] as const,
    list: (params?: unknown) => ["purchase", "list", params] as const,
    detail: (id: string | number) => ["purchase", "detail", id] as const,
  },
} as const;
