export const queryKeys = {
    all: ["settings", "cash-boxes"] as const,
    list: (params?: unknown) =>
      ["settings", "cash-boxes", "list", params] as const,
    detail: (id: string | number) =>
      ["settings", "cash-boxes", "detail", id] as const,
    modules: (organizationId?: string | number) =>
      ["settings", "cash-boxes", "modules", organizationId] as const,
  };
