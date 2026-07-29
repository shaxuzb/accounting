export const payrollPaymentKeys = {
  all: ["payroll", "payments"] as const,
  list: (params?: unknown) => ["payroll", "payments", "list", params] as const,
  detail: (id: string | number) =>
    ["payroll", "payments", "detail", id] as const,
};
