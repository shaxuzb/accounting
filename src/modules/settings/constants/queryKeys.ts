export const settingsKeys = {
  settings: {
    all: ["settings", "settings"] as const,
    list: (params?: unknown) =>
      ["settings", "settings", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "settings", "detail", id] as const,
  },
  role: {
    all: ["settings", "role"] as const,
    list: (params?: unknown) => ["settings", "role", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "role", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "role", "modules", organizationId] as const,
  },
  users: {
    all: ["settings", "users"] as const,
    list: (params?: unknown) => ["settings", "users", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "users", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "role", "modules", organizationId] as const,
  },
  organizations: {
    all: ["settings", "organizations"] as const,
    list: (params?: unknown) =>
      ["settings", "organizations", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "organizations", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "organizations", "modules", organizationId] as const,
  },
  counterparty: {
    all: ["settings", "counterparty"] as const,
    list: (params?: unknown) =>
      ["settings", "counterparty", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "counterparty", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "counterparty", "modules", organizationId] as const,
  },
};
