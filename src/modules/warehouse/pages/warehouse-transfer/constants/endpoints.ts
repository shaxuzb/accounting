export const warehouseTransferEndpoints = {
  list: "warehouse-transfers",
  detail: (id: string | number) => `warehouse-transfers/${id}`,
  create: "warehouse-transfers",
  update: (id: string | number) => `warehouse-transfers/${id}`,
  delete: (id: string | number) => `warehouse-transfers/${id}`,
  confirm: (id: string | number) => `warehouse-transfers/${id}/confirm`,
  cancel: (id: string | number) => `warehouse-transfers/${id}/cancel`,
  postingBatches: (id: string | number) =>
    `warehouse-transfers/${id}/posting-batches`,
  inventoryMovements: (id: string | number) =>
    `warehouse-transfers/${id}/inventory-movements`,
} as const;
