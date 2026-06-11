export const queryKeys = {
    all: ["settings", "counterparty-bank-accounts"] as const,
    list: (params?: unknown) =>
      ["settings", "counterparty-bank-accounts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "counterparty-bank-accounts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "counterparty-bank-accounts", "modules", organizationId] as const,
  };
