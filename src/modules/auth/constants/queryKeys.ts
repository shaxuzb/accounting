export const authKeys = {
  auth: {
    all: ["auth", "auth"] as const,
    list: (params?: unknown) => ["auth", "auth", "list", params] as const,
    detail: (id: string | number) => ["auth", "auth", "detail", id] as const,
  },
  /* modux:querykeys */
};
