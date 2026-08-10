export const retailSaleKeys = {
  all: ["retail-sale-docs"] as const,
  list: (params?: unknown) => ["retail-sale-docs", "list", params] as const,
  detail: (id: string | number) =>
    ["retail-sale-docs", "detail", id] as const,
} as const;
