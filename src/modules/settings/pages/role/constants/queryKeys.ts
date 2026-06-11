export const queryKeys = {
    all: ["settings", "role"] as const,
    list: (params?: unknown) => ["settings", "role", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "role", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "role", "modules", organizationId] as const,
  };
