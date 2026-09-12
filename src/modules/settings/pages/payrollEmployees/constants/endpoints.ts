export const payrollEmployeeEndpoints = {
  // Legacy object name is kept so payroll lookups and existing imports stay stable.
  // Employee ownership and mutations now belong to the HR API.
  list: "hr/employees",
  detail: (id: string | number) => `hr/employees/${id}`,
  create: "hr/employees",
  update: (id: string | number) => `hr/employees/${id}`,
  delete: (id: string | number) => `hr/employees/${id}`,
  employments: (id: string | number) => `hr/employees/${id}/employments`,
  employment: (id: string | number, employmentId: string | number) =>
    `hr/employees/${id}/employments/${employmentId}`,
  components: (id: string | number) => `hr/employees/${id}/components`,
  component: (id: string | number, assignmentId: string | number) =>
    `hr/employees/${id}/components/${assignmentId}`,
  history: (id: string | number) => `hr/employees/${id}/history`,
  transfer: (id: string | number) => `hr/employees/${id}/transfer`,
  changePay: (id: string | number) => `hr/employees/${id}/change-pay`,
  dismiss: (id: string | number) => `hr/employees/${id}/dismiss`,
} as const;
