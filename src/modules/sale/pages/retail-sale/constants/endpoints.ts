export const retailSaleEndpoints = {
  list: "retail-sale-docs",
  detail: (id: string | number) => `retail-sale-docs/${id}`,
  create: "retail-sale-docs",
  update: (id: string | number) => `retail-sale-docs/${id}`,
  delete: (id: string | number) => `retail-sale-docs/${id}`,
  confirm: (id: string | number) => `retail-sale-docs/${id}/confirm`,
  cancel: (id: string | number) => `retail-sale-docs/${id}/cancel`,
} as const;

// These document types are provisioned by the accounting backend for retail sales.
// Keep them in one place so account selects use the same IDs as the API contracts.
export const retailSaleDocumentTypeIds = {
  goods: 10,
  paymentCash: 11,
  paymentCard: 12,
  paymentBankTransfer: 13,
  paymentAcquiring: 14,
} as const;

export const retailSaleAccountingEntriesReportDocumentTypeId = 7;
