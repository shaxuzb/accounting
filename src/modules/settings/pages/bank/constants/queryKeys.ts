export const queryKeys = {
  all: ["settings", "banks"] as const,
  mine: (search?: string) => ["settings", "banks", "mine", search] as const,
  directory: (search?: string) => ["settings", "banks", "directory", search] as const,
};
