export const queryKeys = {
    all: ["settings", "positions"] as const,
    list: (params?: unknown) =>
      ["settings", "positions", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "positions", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "positions", "modules", organizationId] as const,
  };
