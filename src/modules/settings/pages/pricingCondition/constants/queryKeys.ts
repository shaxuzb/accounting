export const queryKeys = {
  all: ["settings", "pricing-conditions"] as const,
  list: (params?: unknown) =>
    ["settings", "pricing-conditions", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "pricing-conditions", "detail", id] as const,
  now: ["settings", "pricing-conditions", "now"] as const,
};
