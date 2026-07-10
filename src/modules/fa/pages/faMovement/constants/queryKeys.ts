export const queryKeys = {
  all: ["fa", "movements"] as const,
  list: (params?: unknown) => ["fa", "movements", "list", params] as const,
  detail: (id: string | number) => ["fa", "movements", "detail", id] as const,
};

