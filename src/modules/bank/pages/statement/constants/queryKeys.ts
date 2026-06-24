export const bankQueryKeys = {
  operations: {
    all: ["bank", "operations"] as const,
    list: (params?: unknown) => ["bank", "operations", "list", params] as const,
  },
};
