export const settingsKeys = {
  settings: {
    all: ["settings", "settings"] as const,
    list: (params?: unknown) => ["settings", "settings", "list", params] as const,
    detail: (id: string | number) => ["settings", "settings", "detail", id] as const,
  },
  users: {
    all: ["settings", "users"] as const,
    list: (params?: unknown) => ["settings", "users", "list", params] as const,
    detail: (id: string | number) => ["settings", "users", "detail", id] as const,
  },
  /* modux:querykeys */
};
