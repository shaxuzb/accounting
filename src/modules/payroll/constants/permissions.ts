/** Modul menyusini ochadigan asosiy permission. */
export const payrollPermissions = {
  view: "PAYROLL_VIEW",
} as const;

export const payrollPeriodPermissions = {
  view: "PAYROLL_PERIOD_VIEW",
  manage: "PAYROLL_PERIOD_MANAGE",
} as const;

export const payrollTimesheetPermissions = {
  view: "PAYROLL_TIMESHEET_VIEW",
  create: "PAYROLL_TIMESHEET_CREATE",
  update: "PAYROLL_TIMESHEET_UPDATE",
  confirm: "PAYROLL_TIMESHEET_CONFIRM",
  cancel: "PAYROLL_TIMESHEET_CANCEL",
} as const;

export const payrollDocumentPermissions = {
  view: "PAYROLL_DOCUMENT_VIEW",
  calculate: "PAYROLL_DOCUMENT_CALCULATE",
  confirm: "PAYROLL_DOCUMENT_CONFIRM",
  cancel: "PAYROLL_DOCUMENT_CANCEL",
  delete: "PAYROLL_DOCUMENT_DELETE",
} as const;

export const payrollPaymentPermissions = {
  view: "PAYROLL_PAYMENT_VIEW",
  create: "PAYROLL_PAYMENT_CREATE",
  confirm: "PAYROLL_PAYMENT_CONFIRM",
  cancel: "PAYROLL_PAYMENT_CANCEL",
} as const;

export const payrollReportPermissions = {
  view: "PAYROLL_REPORT_VIEW",
} as const;
