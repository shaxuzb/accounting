export const queryKeys = {
  all: ["fa", "revaluations"] as const,
  list: (params?: unknown) => ["fa", "revaluations", "list", params] as const,
  detail: (id: string | number) => ["fa", "revaluations", "detail", id] as const,
};

