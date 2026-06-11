export const queryKeys = {
    all: ["settings", "branches"] as const,
    list: (params?: unknown) =>
      ["settings", "branches", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "branches", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "branches", "modules", organizationId] as const,
  };
