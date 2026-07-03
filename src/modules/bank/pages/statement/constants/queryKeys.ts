export const bankQueryKeys = {
  operations: {
    all: ["bank", "operations"] as const,
    list: (params?: unknown) => ["bank", "operations", "list", params] as const,
    detail: (id: string | number) =>
      ["bank", "operations", "detail", id] as const,
  },
};
