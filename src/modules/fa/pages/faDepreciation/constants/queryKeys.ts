export const queryKeys = {
  all: ["fa", "depreciation"] as const,
  lists: () => ["fa", "depreciation", "list"] as const,
  list: (params?: unknown) => ["fa", "depreciation", "list", params] as const,
  details: () => ["fa", "depreciation", "detail"] as const,
  detail: (id: string | number) => ["fa", "depreciation", "detail", id] as const,
};
