export const queryKeys = {
  all: ["settings", "purchase-services"] as const,
  list: (params?: unknown) =>
    ["settings", "purchase-services", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "purchase-services", "detail", id] as const,
};
