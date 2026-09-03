export const queryKeys = {
  all: ["settings", "regulated-obligation-settings"] as const,
  list: (params?: unknown) =>
    ["settings", "regulated-obligation-settings", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "regulated-obligation-settings", "detail", id] as const,
};
