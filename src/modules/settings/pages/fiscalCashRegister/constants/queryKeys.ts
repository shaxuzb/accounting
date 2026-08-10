export const queryKeys = {
  all: ["settings", "fiscal-cash-registers"] as const,
  list: (params?: unknown) =>
    ["settings", "fiscal-cash-registers", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "fiscal-cash-registers", "detail", id] as const,
};
