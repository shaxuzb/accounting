export const queryKeys = {
  all: ["fa", "assets"] as const,
  lists: () => ["fa", "assets", "list"] as const,
  list: (params?: unknown) => [...queryKeys.lists(), params] as const,
  details: () => ["fa", "assets", "detail"] as const,
  detail: (id: string | number) => [...queryKeys.details(), id] as const,
};
