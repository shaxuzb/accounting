export const queryKeys = {
    all: ["settings", "chart-accounts"] as const,
    list: (params?: unknown) =>
      ["settings", "chart-accounts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "chart-accounts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "chart-accounts", "modules", organizationId] as const,
    presetAccounts: (params?: unknown) =>
      ["settings", "chart-account-preset-accounts", "grouped", params] as const,
  };
