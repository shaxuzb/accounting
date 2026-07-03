export const inventoryCountEndpoints = {
  list: "inventory-counts",
  detail: (id: string | number) => `inventory-counts/${id}`,
  create: "inventory-counts",
  update: (id: string | number) => `inventory-counts/${id}`,
  delete: (id: string | number) => `inventory-counts/${id}`,
  confirm: (id: string | number) => `inventory-counts/${id}/confirm`,
  cancel: (id: string | number) => `inventory-counts/${id}/cancel`,
  postingBatches: (id: string | number) => `inventory-counts/${id}/posting-batches`,
  inventoryMovements: (id: string | number) =>
    `inventory-counts/${id}/inventory-movements`,
  differences: (id: string | number) => `inventory-counts/${id}/differences`,
} as const;
