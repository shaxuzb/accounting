export const queryKeys = {
  all: ["settings", "opening-inventory"] as const,
  lists: (name: string, params?: unknown) =>
    [...queryKeys.all, "list", name, params] as const,
  details: (name: string, id: string | number | undefined) =>
    [...queryKeys.all, "detail", name, id] as const,
};
