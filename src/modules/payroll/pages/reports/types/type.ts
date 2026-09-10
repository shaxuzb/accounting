import type { PayrollComponentType } from "../../../constants/options";

export interface PayrollRegisterEmployee {
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  workedDays?: number | null;
  workedHours?: number | null;
  paidLeaveDays?: number | null;
  paidSickDays?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  reconciliationVariance?: number | null;
  grossAmount: number;
  deductionAmount: number;
  employerTaxAmount: number;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  regularGrossAmount?: number | null;
  correctionGrossAmount?: number | null;
}

export interface PayrollRegisterReport {
  periodId: number;
  periodYear?: number | null;
  periodMonth?: number | null;
  periodName?: string | null;
  currencyName?: string | null;
  grossAmount: number;
  deductionAmount: number;
  employerTaxAmount: number;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  regularGrossAmount?: number | null;
  regularNetAmount?: number | null;
  correctionGrossAmount?: number | null;
  correctionNetAmount?: number | null;
  paidLeaveDays?: number | null;
  paidSickDays?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  reconciliationVariance?: number | null;
  employees: PayrollRegisterEmployee[];
}

export interface PayrollPayslipComponent {
  componentId?: number | null;
  code?: string | null;
  name?: string | null;
  componentType?: PayrollComponentType | null;
  baseAmount?: number | null;
  rate?: number | null;
  amount: number;
}

export interface PayrollPayslipReport {
  periodId: number;
  periodYear?: number | null;
  periodMonth?: number | null;
  periodName?: string | null;
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  currencyName?: string | null;
  workedDays?: number | null;
  workedHours?: number | null;
  normWorkDays?: number | null;
  normWorkHours?: number | null;
  paidLeaveDays?: number | null;
  paidSickDays?: number | null;
  overtimeHours?: number | null;
  nightHours?: number | null;
  holidayHours?: number | null;
  weekendHours?: number | null;
  reconciliationVariance?: number | null;
  grossAmount: number;
  deductionAmount: number;
  employerTaxAmount: number;
  advanceAmount?: number | null;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  regularGrossAmount?: number | null;
  regularNetAmount?: number | null;
  correctionGrossAmount?: number | null;
  correctionNetAmount?: number | null;
  components: PayrollPayslipComponent[];
}
