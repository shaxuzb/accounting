export const payrollTimesheetKeys = {
  all: ["payroll", "timesheets"] as const,
  list: (params?: unknown) => ["payroll", "timesheets", "list", params] as const,
  detail: (id: string | number) =>
    ["payroll", "timesheets", "detail", id] as const,
  attendanceStatusOptions: () => ["payroll", "timesheets", "attendance-status-options"] as const,
};
