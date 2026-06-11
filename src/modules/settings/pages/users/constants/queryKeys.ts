export const queryKeys = {
    all: ["settings", "users"] as const,
    list: (params?: unknown) => ["settings", "users", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "users", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "users", "modules", organizationId] as const,
  };
