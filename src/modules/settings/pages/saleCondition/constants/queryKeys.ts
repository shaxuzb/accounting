export const queryKeys = {
  all: ["settings", "sale-conditions"] as const,
  list: (params?: unknown) =>
    ["settings", "sale-conditions", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "sale-conditions", "detail", id] as const,
  now: ["settings", "sale-conditions", "now"] as const,
};
