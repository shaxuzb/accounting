export const payrollTimesheetEndpoints = {
  list: "payroll/timesheets",
  detail: (id: string | number) => `payroll/timesheets/${id}`,
  create: "payroll/timesheets",
  update: (id: string | number) => `payroll/timesheets/${id}`,
  confirm: (id: string | number) => `payroll/timesheets/${id}/confirm`,
  cancel: (id: string | number) => `payroll/timesheets/${id}/cancel`,
  detailCalendar: (id: string | number) => `payroll/timesheets/${id}/calendar`,
  employeeCalendar: "payroll/timesheets/calendar",
} as const;
