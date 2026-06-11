export const queryKeys = {
    all: ["settings", "counterparty-cards"] as const,
    list: (params?: unknown) =>
      ["settings", "counterparty-cards", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "counterparty-cards", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "counterparty-cards", "modules", organizationId] as const,
  };
