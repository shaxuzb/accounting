export const queryKeys = {
  all: ["fa", "revaluations"] as const,
  lists: () => ["fa", "revaluations", "list"] as const,
  list: (params?: unknown) => ["fa", "revaluations", "list", params] as const,
  details: () => ["fa", "revaluations", "detail"] as const,
  detail: (id: string | number) => ["fa", "revaluations", "detail", id] as const,
};
