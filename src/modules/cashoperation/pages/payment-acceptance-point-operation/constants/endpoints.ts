export const paymentAcceptancePointOperationEndpoints = {
  list: "payment-acceptance-point-operations",
  detail: (id: string | number) => `payment-acceptance-point-operations/${id}`,
  balance: "payment-acceptance-point-operations/balance",
  create: "payment-acceptance-point-operations",
  update: (id: string | number) => `payment-acceptance-point-operations/${id}`,
  delete: (id: string | number) => `payment-acceptance-point-operations/${id}`,
  confirm: (id: string | number) => `payment-acceptance-point-operations/${id}/confirm`,
  cancel: (id: string | number) => `payment-acceptance-point-operations/${id}/cancel`,
} as const;
