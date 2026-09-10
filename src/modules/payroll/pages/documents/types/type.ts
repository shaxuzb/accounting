import type {
  PayrollCalculationMethod,
  PayrollComponentType,
  PayrollDocumentKind,
} from "../../../constants/options";

export interface PayrollCalcLine {
  id?: number;
  componentId: number;
  componentCode?: string | null;
  componentName?: string | null;
  componentType?: PayrollComponentType | null;
  calculationMethod?: PayrollCalculationMethod | null;
  baseAmount?: number | null;
  quantity?: number | null;
  rate?: number | null;
  amount: number;
  isManual?: boolean;
  note?: string | null;
  debitAccountId?: number | null;
  creditAccountId?: number | null;
}

export interface PayrollTaxLine {
  id?: number;
  taxDefinitionId: number;
  taxCode?: string | null;
  taxName?: string | null;
  taxType?: "WITHHOLDING" | "EMPLOYER" | string | null;
  baseType?: string | null;
  baseAmount: number;
  exemptionAmount: number;
  taxableBase: number;
  rate: number;
  amount: number;
  liabilityAccountId: number;
}

export interface PayrollLineSegment {
  id?: number;
  employmentId?: number;
  segmentStartDate: string;
  segmentEndDate: string;
  monthlySalary: number;
  employmentRate: number;
  workedDays: number;
  workedHours: number;
  normWorkDays: number;
  normWorkHours: number;
  componentSnapshotJson?: string | null;
}

export interface PayrollDocumentLine {
  id?: number;
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
  grossAmount: number;
  deductionAmount: number;
  employerTaxAmount: number;
  advanceAmount?: number | null;
  netAmount: number;
  payableAmount: number;
  paidAmount?: number | null;
  outstandingAmount?: number | null;
  calcLines?: PayrollCalcLine[];
  taxLines?: PayrollTaxLine[];
  segments?: PayrollLineSegment[];
}

export interface PayrollDocument {
  id: number;
  organizationId?: number | null;
  docNumber?: string | null;
  docDate: string;
  periodId: number;
  periodYear?: number | null;
  periodMonth?: number | null;
  periodName?: string | null;
  documentKind: PayrollDocumentKind;
  correctionOfDocId?: number | null;
  correctionOfDocNumber?: string | null;
  correctionPayoutMode?: "WITH_SALARY" | "WITH_ADVANCE" | "SEPARATE" | null;
  salaryExpenseAccountId?: number | null;
  salaryPayableAccountId?: number | null;
  currencyId?: number | null;
  note?: string | null;
  employeeCount?: number | null;
  grossAmount?: number | null;
  deductionAmount?: number | null;
  employerTaxAmount?: number | null;
  advanceAmount?: number | null;
  netAmount?: number | null;
  payableAmount?: number | null;
  paidAmount?: number | null;
  outstandingAmount?: number | null;
  currencyName?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  stateId?: number | null;
  createdDate?: string | null;
  postedAt?: string | null;
  cancelledAt?: string | null;
  hasPendingRecalculation?: boolean;
  pendingRecalculationId?: number | null;
  lines?: PayrollDocumentLine[];
}
