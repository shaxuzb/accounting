export const queryKeys = {
  all: ["fa", "receipts"] as const,
  lists: () => ["fa", "receipts", "list"] as const,
  list: (params?: unknown) => ["fa", "receipts", "list", params] as const,
  details: () => ["fa", "receipts", "detail"] as const,
  detail: (id: string | number) => ["fa", "receipts", "detail", id] as const,
};
