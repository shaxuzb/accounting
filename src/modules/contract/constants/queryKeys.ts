export const contractKeys = {
  contract: {
    all: ["contracts"] as const,
    list: (params?: unknown) => ["contracts", "list", params] as const,
    detail: (id: string | number) => ["contracts", "detail", id] as const,
  },
} as const;
