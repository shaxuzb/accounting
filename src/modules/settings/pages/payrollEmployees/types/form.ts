import type { PayrollAdvanceMethod, PayrollEmploymentType } from "@/modules/payroll/constants/options";

export interface PayrollEmploymentForm {
  departmentId: number | null;
  positionId: number | null;
  employmentType: PayrollEmploymentType | null;
  startDate: string;
  endDate: string | null;
  monthlySalary: number | null;
  employmentRate: number | null;
  weeklyHours: number | null;
  currencyId: number | null;
  expenseAccountId: number | null;
  advanceMethod: PayrollAdvanceMethod;
  advanceValue: number | null;
  note: string | null;
}

export interface PayrollEmploymentTransferForm {
  effectiveDate: string;
  departmentId?: number | null;
  positionId?: number | null;
  employmentType?: PayrollEmploymentType | null;
  monthlySalary?: number | null;
  employmentRate?: number | null;
  weeklyHours?: number | null;
  currencyId?: number | null;
  expenseAccountId?: number | null;
  advanceMethod?: PayrollAdvanceMethod | null;
  advanceValue?: number | null;
  note?: string | null;
}

export interface PayrollEmploymentPayChangeForm {
  effectiveDate: string;
  monthlySalary: number;
  employmentRate?: number | null;
  note?: string | null;
}

export interface PayrollEmploymentDismissForm {
  effectiveDate: string;
  note?: string | null;
}

export interface PayrollEmployeeMainForm {
  employeeNumber: string;
  pinfl: string | null;
  tin: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  birthDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  bankAccountNumber: string | null;
}

export interface PayrollEmployeeForm extends PayrollEmployeeMainForm {
  employment: PayrollEmploymentForm;
}

export interface PayrollEmployeeComponentForm {
  componentId: number | null;
  amount: number | null;
  rate: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  note: string | null;
}
