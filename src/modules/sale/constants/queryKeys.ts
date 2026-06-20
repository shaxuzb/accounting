export const saleKeys = {
  all: ["sale"] as const,
  docs: {
    all: ["sale", "docs"] as const,
    list: (params?: unknown) => ["sale", "docs", "list", params] as const,
    detail: (id: string | number) => ["sale", "docs", "detail", id] as const,
  },
  tables: {
    all: ["sale", "tables"] as const,
    list: (ownerId: string | number) =>
      ["sale", "tables", "list", ownerId] as const,
  },
};
