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
      ["settings", "users", "modules", organizationId] as const,
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
    all: ["settings", "counterparty-cards"] as const,
    list: (params?: unknown) =>
      ["settings", "counterparty-cards", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "counterparty-cards", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "counterparty-cards", "modules", organizationId] as const,
  },
   departments: {
    all: ["settings", "departments"] as const,
    list: (params?: unknown) =>
      ["settings", "departments", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "departments", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "departments", "modules", organizationId] as const,
  },
  branches: {
    all: ["settings", "branches"] as const,
    list: (params?: unknown) =>
      ["settings", "branches", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "branches", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "branches", "modules", organizationId] as const,
  },
  chartAccounts: {
    all: ["settings", "chart-accounts"] as const,
    list: (params?: unknown) =>
      ["settings", "chart-accounts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "chart-accounts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "chart-accounts", "modules", organizationId] as const,
  },
  counterpartyBankAccount: {
    all: ["settings", "counterparty-bank-accounts"] as const,
    list: (params?: unknown) =>
      ["settings", "counterparty-bank-accounts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "counterparty-bank-accounts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "counterparty-bank-accounts", "modules", organizationId] as const,
  },
  orgBankAccounts: {
    all: ["settings", "org-bank-accounts"] as const,
    list: (params?: unknown) =>
      ["settings", "org-bank-accounts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "org-bank-accounts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "org-bank-accounts", "modules", organizationId] as const,
  },
  positions: {
    all: ["settings", "positions"] as const,
    list: (params?: unknown) =>
      ["settings", "positions", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "positions", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "positions", "modules", organizationId] as const,
  },
    productGroups: {
    all: ["settings", "product-groups"] as const,
    list: (params?: unknown) =>
      ["settings", "product-groups", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "product-groups", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "product-groups", "modules", organizationId] as const,
  },
};
