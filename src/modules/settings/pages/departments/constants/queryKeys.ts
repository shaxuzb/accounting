export const queryKeys = {
    all: ["settings", "departments"] as const,
    list: (params?: unknown) =>
      ["settings", "departments", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "departments", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "departments", "modules", organizationId] as const,
  };
