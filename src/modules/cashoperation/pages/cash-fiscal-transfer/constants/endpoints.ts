export const cashFiscalTransferEndpoints = {
  list: "cash-fiscal-transfers",
  detail: (id: string | number) => `cash-fiscal-transfers/${id}`,
  create: "cash-fiscal-transfers",
  update: (id: string | number) => `cash-fiscal-transfers/${id}`,
  delete: (id: string | number) => `cash-fiscal-transfers/${id}`,
  confirm: (id: string | number) => `cash-fiscal-transfers/${id}/confirm`,
  cancel: (id: string | number) => `cash-fiscal-transfers/${id}/cancel`,
} as const;
