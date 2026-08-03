export const queryKeys = {
  all: ["fa", "movements"] as const,
  lists: () => ["fa", "movements", "list"] as const,
  list: (params?: unknown) => ["fa", "movements", "list", params] as const,
  details: () => ["fa", "movements", "detail"] as const,
  detail: (id: string | number) => ["fa", "movements", "detail", id] as const,
};
