export const queryKeys = {
  all: ["settings", "bank-terminals"] as const,
  list: (params?: unknown) =>
    ["settings", "bank-terminals", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "bank-terminals", "detail", id] as const,
};
