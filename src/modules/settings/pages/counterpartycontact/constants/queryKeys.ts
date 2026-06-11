export const queryKeys = {
    all: ["settings", "counterparty-contacts"] as const,
    list: (params?: unknown) =>
      ["settings", "counterparty-contacts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "counterparty-contacts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "counterparty-contacts", "modules", organizationId] as const,
  };
