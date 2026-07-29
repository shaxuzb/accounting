export const payrollComponentEndpoints = {
  list: "payroll/components",
  detail: (id: string | number) => `payroll/components/${id}`,
  create: "payroll/components",
  update: (id: string | number) => `payroll/components/${id}`,
  delete: (id: string | number) => `payroll/components/${id}`,
} as const;
