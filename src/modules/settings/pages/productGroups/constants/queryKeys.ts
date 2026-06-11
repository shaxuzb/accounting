export const queryKeys = {
    all: ["settings", "product-groups"] as const,
    list: (params?: unknown) =>
      ["settings", "product-groups", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "product-groups", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "product-groups", "modules", organizationId] as const,
  };
