export const hrEmployeeEndpoints = {
  workSchedules: (employeeId: string | number) =>
    `hr/employees/${employeeId}/work-schedules`,
  workSchedule: (
    employeeId: string | number,
    scheduleId: string | number,
  ) => `hr/employees/${employeeId}/work-schedules/${scheduleId}`,
  calendar: (employeeId: string | number) =>
    `hr/employees/${employeeId}/calendar`,
} as const;
