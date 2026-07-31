export const hrEmployeePermissions = {
  // Eski employee API va view huquqi migratsiya davrida saqlanadi.
  view: "PAYROLL_EMPLOYEE_VIEW",
  create: "HR_EMPLOYEE_CREATE",
  update: "HR_EMPLOYEE_UPDATE",
  delete: "HR_EMPLOYEE_DELETE",
} as const;

export const hrAbsencePermissions = {
  view: "HR_ABSENCE_VIEW",
  create: "HR_ABSENCE_CREATE",
  update: "HR_ABSENCE_UPDATE",
  delete: "HR_ABSENCE_DELETE",
} as const;

export const hrViewPermissions = [
  hrEmployeePermissions.view,
  hrAbsencePermissions.view,
] as const;
