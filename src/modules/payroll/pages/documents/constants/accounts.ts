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
  {
    fieldName: "deductionPayableAccountId",
    roleCode: "deduction_payable",
    label: "payroll.fields.deductionPayableAccount",
  },
  {
    fieldName: "employerTaxExpenseAccountId",
    roleCode: "employer_tax_expense",
    label: "payroll.fields.employerTaxExpenseAccount",
  },
  {
    fieldName: "employerTaxPayableAccountId",
    roleCode: "employer_tax_payable",
    label: "payroll.fields.employerTaxPayableAccount",
  },
  {
    fieldName: "advanceReceivableAccountId",
    roleCode: "advance_receivable",
    label: "payroll.fields.advanceReceivableAccount",
  },
] as const;

export type PayrollDocumentAccountFieldName =
  (typeof payrollDocumentAccountFields)[number]["fieldName"];
