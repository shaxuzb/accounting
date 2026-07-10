export const queryKeys = {
  all: ["fa", "assets"] as const,
  list: (params?: unknown) => ["fa", "assets", "list", params] as const,
  detail: (id: string | number) => ["fa", "assets", "detail", id] as const,
  create: () => ["fa", "assets", "create"] as const,
  update: (id: string | number) => ["fa", "assets", "update", id] as const,
  remove: (id: string | number) => ["fa", "assets", "remove", id] as const,
};

