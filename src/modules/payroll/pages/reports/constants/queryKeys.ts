export const payrollReportKeys = {
  all: ["payroll", "reports"] as const,
  register: (periodId?: number | null) =>
    ["payroll", "reports", "register", periodId ?? null] as const,
  payslip: (periodId?: number | null, employeeId?: number | null) =>
    ["payroll", "reports", "payslip", periodId ?? null, employeeId ?? null] as const,
};
