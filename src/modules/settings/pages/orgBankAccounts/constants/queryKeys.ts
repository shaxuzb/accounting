export const queryKeys = {
    all: ["settings", "org-bank-accounts"] as const,
    list: (params?: unknown) =>
      ["settings", "org-bank-accounts", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "org-bank-accounts", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "org-bank-accounts", "modules", organizationId] as const,
  };
