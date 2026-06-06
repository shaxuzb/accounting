export const settingsKeys = {
  settings: {
    all: ["settings", "settings"] as const,
    list: (params?: unknown) => ["settings", "settings", "list", params] as const,
    detail: (id: string | number) => ["settings", "settings", "detail", id] as const,
  },
  /* modux:querykeys */
};
