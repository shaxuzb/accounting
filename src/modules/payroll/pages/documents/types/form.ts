import type { PayrollDocumentKind } from "../../../constants/options";

export interface PayrollDocumentAdjustmentForm {
  employeeId: number | null;
  componentId: number | null;
  amount: number | null;
  note: string | null;
}

export interface PayrollCalculateForm {
  periodId: number | null;
  docDate: string;
  documentKind: PayrollDocumentKind;
  correctionOfDocId: number | null;
  salaryExpenseAccountId: number | null;
  salaryPayableAccountId: number | null;
  deductionPayableAccountId: number | null;
  employerTaxExpenseAccountId: number | null;
  employerTaxPayableAccountId: number | null;
  advanceReceivableAccountId: number | null;
  note: string | null;
  adjustments: PayrollDocumentAdjustmentForm[];
}
