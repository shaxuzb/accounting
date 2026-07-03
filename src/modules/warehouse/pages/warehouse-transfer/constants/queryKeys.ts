export const warehouseTransferKeys = {
  all: ["warehouseTransfer"] as const,
  list: (params?: unknown) => ["warehouseTransfer", "list", params] as const,
  detail: (id: string | number) => ["warehouseTransfer", "detail", id] as const,
} as const;
