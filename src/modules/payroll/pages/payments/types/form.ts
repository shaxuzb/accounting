import type {
  PayrollPaymentKind,
  PayrollSourceType,
} from "../../../constants/options";

export interface PayrollPaymentLineForm {
  employeeId: number | null;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  payableAmount?: number | null;
  amount: number | null;
  note: string | null;
}

export interface PayrollPaymentForm {
  periodId: number | null;
  payrollDocId: number | null;
  docDate: string;
  paymentKind: PayrollPaymentKind;
  sourceType: PayrollSourceType;
  bankAccountId: number | null;
  cashBoxId: number | null;
  sourceChartAccountId: number | null;
  offsetAccountId: number | null;
  currencyId: number | null;
  note: string | null;
  lines: PayrollPaymentLineForm[];
}
