export const queryKeys = {
  all: ["fa", "depreciation"] as const,
  list: (params?: unknown) => ["fa", "depreciation", "list", params] as const,
  detail: (id: string | number) => ["fa", "depreciation", "detail", id] as const,
};

