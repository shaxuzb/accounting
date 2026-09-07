import type {
  PayrollPaymentKind,
  PayrollSourceType,
} from "../../../constants/options";

export interface PayrollPaymentLine {
  id?: number;
  employeeId: number;
  employeeName?: string | null;
  employeeNumber?: string | null;
  departmentName?: string | null;
  bankAccountNumber?: string | null;
  payableAmount?: number | null;
  paidAmount?: number | null;
  amount: number;
  note?: string | null;
}

export interface PayrollPayment {
  id: number;
  docNumber?: string | null;
  docDate: string;
  periodId: number;
  periodYear?: number | null;
  periodMonth?: number | null;
  periodName?: string | null;
  payrollDocId?: number | null;
  payrollDocNumber?: string | null;
  paymentKind: PayrollPaymentKind;
  sourceType: PayrollSourceType;
  bankAccountId?: number | null;
  bankAccountName?: string | null;
  cashBoxId?: number | null;
  cashBoxName?: string | null;
  sourceChartAccountId?: number | null;
  sourceChartAccountName?: string | null;
  offsetAccountId?: number | null;
  offsetAccountName?: string | null;
  currencyId?: number | null;
  currencyName?: string | null;
  totalAmount?: number | null;
  employeeCount?: number | null;
  note?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  bankOperationId?: number | null;
  cashOperationId?: number | null;
  createdDate?: string | null;
  lines?: PayrollPaymentLine[];
}
