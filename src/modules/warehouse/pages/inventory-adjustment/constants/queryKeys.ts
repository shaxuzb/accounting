export const inventoryAdjustmentKeys = {
  all: ["inventoryAdjustment"] as const,
  list: (params?: unknown) => ["inventoryAdjustment", "list", params] as const,
  detail: (id: string | number) =>
    ["inventoryAdjustment", "detail", id] as const,
} as const;
