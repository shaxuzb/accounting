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

export interface PayrollDocumentLine {
  id?: number;
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  workedDays?: number | null;
  workedHours?: number | null;
  grossAmount: number;
  deductionAmount: number;
  employerTaxAmount: number;
  advanceAmount?: number | null;
  netAmount: number;
  payableAmount: number;
  paidAmount?: number | null;
  outstandingAmount?: number | null;
  calcLines?: PayrollCalcLine[];
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
  salaryExpenseAccountId?: number | null;
  salaryPayableAccountId?: number | null;
  deductionPayableAccountId?: number | null;
  employerTaxExpenseAccountId?: number | null;
  employerTaxPayableAccountId?: number | null;
  advanceReceivableAccountId?: number | null;
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
  lines?: PayrollDocumentLine[];
}
