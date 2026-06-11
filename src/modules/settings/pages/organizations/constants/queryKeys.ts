export const queryKeys = {
    all: ["settings", "organizations"] as const,
    list: (params?: unknown) =>
      ["settings", "organizations", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "organizations", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "organizations", "modules", organizationId] as const,
  };
