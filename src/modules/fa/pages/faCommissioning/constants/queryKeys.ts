export const queryKeys = {
  all: ["fa-commissionings"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (params?: unknown) => [...queryKeys.lists(), params] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...queryKeys.details(), id] as const,
};
