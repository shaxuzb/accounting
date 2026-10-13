export const payrollEmployeeEndpoints = {
  // Legacy object name is kept so payroll lookups and existing imports stay stable.
  // Employee ownership and mutations now belong to the HR API.
  list: "hr/employees",
  detail: (id: string | number) => `hr/employees/${id}`,
  create: "hr/employees",
  update: (id: string | number) => `hr/employees/${id}`,
  delete: (id: string | number) => `hr/employees/${id}`,
  history: (id: string | number) => `hr/employees/${id}/history`,
} as const;
