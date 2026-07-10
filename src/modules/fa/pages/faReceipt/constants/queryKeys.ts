export const queryKeys = {
  all: ["fa", "receipts"] as const,
  list: (params?: unknown) => ["fa", "receipts", "list", params] as const,
  detail: (id: string | number) => ["fa", "receipts", "detail", id] as const,
};

