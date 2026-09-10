export const PAYROLL_ACCRUAL_DOCUMENT_TYPE_ID = 9;

export const payrollDocumentAccountFields = [
  {
    fieldName: "salaryExpenseAccountId",
    roleCode: "salary_expense",
    label: "payroll.fields.salaryExpenseAccount",
  },
  {
    fieldName: "salaryPayableAccountId",
    roleCode: "salary_payable",
    label: "payroll.fields.salaryPayableAccount",
  },
] as const;

export type PayrollDocumentAccountFieldName =
  (typeof payrollDocumentAccountFields)[number]["fieldName"];
