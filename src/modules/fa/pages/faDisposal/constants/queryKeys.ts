export const queryKeys = {
  all: ["fa", "disposals"] as const,
  lists: () => ["fa", "disposals", "list"] as const,
  list: (params?: unknown) => ["fa", "disposals", "list", params] as const,
  details: () => ["fa", "disposals", "detail"] as const,
  detail: (id: string | number) => ["fa", "disposals", "detail", id] as const,
};
