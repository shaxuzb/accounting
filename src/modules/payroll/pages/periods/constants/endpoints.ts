export const payrollPeriodEndpoints = {
  list: "payroll/periods",
  detail: (id: string | number) => `payroll/periods/${id}`,
  create: "payroll/periods",
  close: (id: string | number) => `payroll/periods/${id}/close`,
  reopen: (id: string | number) => `payroll/periods/${id}/reopen`,
} as const;
