export const payrollPaymentKeys = {
  all: ["payroll", "payments"] as const,
  list: (params?: unknown) => ["payroll", "payments", "list", params] as const,
  detail: (id: string | number) =>
    ["payroll", "payments", "detail", id] as const,
  advanceSuggestion: (periodId: string | number) =>
    ["payroll", "payments", "advance-suggestion", periodId] as const,
};
