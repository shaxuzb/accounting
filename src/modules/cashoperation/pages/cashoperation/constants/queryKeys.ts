export const cashOperationKeys = {
  list: (params?: unknown) => ["cashOperations", "list", params] as const,
  detail: (id: string | number) => ["cashOperations", "detail", id] as const,
} as const;
