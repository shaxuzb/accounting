export const payrollTaxDefinitionEndpoints = {
  list: "payroll/taxes",
  detail: (id: string | number) => `payroll/taxes/${id}`,
  create: "payroll/taxes",
  update: (id: string | number) => `payroll/taxes/${id}`,
  delete: (id: string | number) => `payroll/taxes/${id}`,
} as const;
