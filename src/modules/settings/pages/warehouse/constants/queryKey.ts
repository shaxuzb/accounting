export const queryKeys = {
    all: ["settings", "warehouses"] as const,
    list: (params?: unknown) =>
      ["settings", "warehouses", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "warehouses", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "warehouses", "modules", organizationId] as const,
  };
