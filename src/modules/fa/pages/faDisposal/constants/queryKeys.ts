export const queryKeys = {
  all: ["fa", "disposals"] as const,
  list: (params?: unknown) => ["fa", "disposals", "list", params] as const,
  detail: (id: string | number) => ["fa", "disposals", "detail", id] as const,
};

