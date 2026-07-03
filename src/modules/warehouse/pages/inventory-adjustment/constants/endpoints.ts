export const inventoryAdjustmentEndpoints = {
  list: "inventory-adjustments",
  detail: (id: string | number) => `inventory-adjustments/${id}`,
  create: "inventory-adjustments",
  update: (id: string | number) => `inventory-adjustments/${id}`,
  delete: (id: string | number) => `inventory-adjustments/${id}`,
  confirm: (id: string | number) => `inventory-adjustments/${id}/confirm`,
  cancel: (id: string | number) => `inventory-adjustments/${id}/cancel`,
  postingBatches: (id: string | number) =>
    `inventory-adjustments/${id}/posting-batches`,
  inventoryMovements: (id: string | number) =>
    `inventory-adjustments/${id}/inventory-movements`,
} as const;
