/**
 * The tax endpoints are all guarded by the payroll module permission on the
 * backend (PayrollTaxDefinitionController), so the page uses the same one.
 */
export const payrollTaxDefinitionPermissions = {
  view: "PAYROLL_VIEW",
  create: "PAYROLL_VIEW",
  update: "PAYROLL_VIEW",
  delete: "PAYROLL_VIEW",
} as const;
