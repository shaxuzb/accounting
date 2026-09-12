import type { PayrollDocumentKind } from "../../../constants/options";

export interface PayrollDocumentAdjustmentForm {
  employeeId: number | null;
  componentId: number | null;
  amount?: number | null;
  targetAmount?: number | null;
  mode?: "AMOUNT" | "TARGET";
  note: string | null;
}

export interface PayrollDraftCalcLineForm {
  calcLineId: number;
  amount?: number | null;
  debitAccountId?: number | null;
  creditAccountId?: number | null;
}

export interface PayrollDraftTaxLineForm {
  taxLineId: number;
  amount?: number | null;
  liabilityAccountId?: number | null;
}

export interface PayrollDraftLineForm {
  lineId: number;
  calcLines?: PayrollDraftCalcLineForm[];
  taxLines?: PayrollDraftTaxLineForm[];
}

export interface PayrollDraftUpdateForm {
  salaryExpenseAccountId?: number | null;
  salaryPayableAccountId?: number | null;
  lines: PayrollDraftLineForm[];
}

export interface PayrollCalculateForm {
  periodId: number | null;
  docDate: string;
  documentKind: PayrollDocumentKind;
  correctionOfDocId: number | null;
  correctionPayoutMode: "WITH_SALARY" | "WITH_ADVANCE" | "SEPARATE";
  salaryExpenseAccountId: number | null;
  salaryPayableAccountId: number | null;
  note: string | null;
  adjustments: PayrollDocumentAdjustmentForm[];
}
