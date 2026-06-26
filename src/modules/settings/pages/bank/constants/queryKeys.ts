export const queryKeys = {
  all: ["settings", "banks"] as const,
  list: (params?: unknown) => ["settings", "banks", "list", params] as const,
  detail: (id: string | number) => ["settings", "banks", "detail", id] as const,
};
