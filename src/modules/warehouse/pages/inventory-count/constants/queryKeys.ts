export const inventoryCountKeys = {
  all: ["inventoryCount"] as const,
  list: (params?: unknown) => ["inventoryCount", "list", params] as const,
  detail: (id: string | number) => ["inventoryCount", "detail", id] as const,
  differences: (id: string | number) =>
    ["inventoryCount", "differences", id] as const,
  postingBatches: (id: string | number) =>
    ["inventoryCount", "posting-batches", id] as const,
  inventoryMovements: (id: string | number) =>
    ["inventoryCount", "inventory-movements", id] as const,
} as const;
