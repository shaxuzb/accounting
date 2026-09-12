export const payrollPaymentEndpoints = {
  list: "payroll/payments",
  detail: (id: string | number) => `payroll/payments/${id}`,
  create: "payroll/payments",
  advanceSuggestion: "payroll/payments/advance-suggestion",
  confirm: (id: string | number) => `payroll/payments/${id}/confirm`,
  cancel: (id: string | number) => `payroll/payments/${id}/cancel`,
} as const;
