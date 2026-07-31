export const hrEmployeeKeys = {
  all: ["hr", "employees"] as const,
  workSchedules: (employeeId: string | number) =>
    [...hrEmployeeKeys.all, String(employeeId), "work-schedules"] as const,
  calendar: (
    employeeId: string | number,
    dateFrom: string,
    dateTo: string,
  ) =>
    [
      ...hrEmployeeKeys.all,
      String(employeeId),
      "calendar",
      dateFrom,
      dateTo,
    ] as const,
};
