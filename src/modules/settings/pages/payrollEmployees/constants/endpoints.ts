export const payrollEmployeeEndpoints = {
  list: "payroll/employees",
  detail: (id: string | number) => `payroll/employees/${id}`,
  create: "payroll/employees",
  update: (id: string | number) => `payroll/employees/${id}`,
  delete: (id: string | number) => `payroll/employees/${id}`,
  employments: (id: string | number) => `payroll/employees/${id}/employments`,
  employment: (id: string | number, employmentId: string | number) =>
    `payroll/employees/${id}/employments/${employmentId}`,
  components: (id: string | number) => `payroll/employees/${id}/components`,
  component: (id: string | number, assignmentId: string | number) =>
    `payroll/employees/${id}/components/${assignmentId}`,
} as const;
