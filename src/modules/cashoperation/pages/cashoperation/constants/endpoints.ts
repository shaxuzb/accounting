export const cashOperationEndpoints = {
  list: "cash-operations",
  detail: (id: string | number) => `cash-operations/${id}`,
  create: "cash-operations",
  update: (id: string | number) => `cash-operations/${id}`,
  delete: (id: string | number) => `cash-operations/${id}`,
} as const;
