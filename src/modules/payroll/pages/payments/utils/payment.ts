import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../../../utils/format";
import type {
  PayrollPaymentForm,
  PayrollPaymentLineForm,
} from "../types/form";
import type {
  PayrollPayment,
} from "../types/type";
import type { PayrollDocument } from "@/modules/payroll/pages/documents/types/type";
export { mapAdvanceSuggestionToPaymentLines } from "./advanceSuggestion";

export const createPaymentLine = (
  overrides: Partial<PayrollPaymentLineForm> = {},
): PayrollPaymentLineForm => ({
  employeeId: null,
  employeeName: null,
  employeeNumber: null,
  departmentName: null,
  payableAmount: null,
  amount: null,
  note: null,
  ...overrides,
});

export const createDefaultPaymentForm = (): PayrollPaymentForm => ({
  periodId: null,
  payrollDocId: null,
  docDate: dayjs().format(DATE_TIME_FORMAT),
  paymentKind: "FINAL",
  sourceType: "BANK",
  bankAccountId: null,
  cashBoxId: null,
  sourceChartAccountId: null,
  offsetAccountId: null,
  currencyId: null,
  note: null,
  lines: [],
});

export const mapPaymentToForm = (
  record?: PayrollPayment | null,
): PayrollPaymentForm => {
  if (!record) return createDefaultPaymentForm();
  return {
    periodId: record.periodId ?? null,
    payrollDocId: record.payrollDocId ?? null,
    docDate: record.docDate,
    paymentKind: record.paymentKind,
    sourceType: record.sourceType,
    bankAccountId: record.bankAccountId ?? null,
    cashBoxId: record.cashBoxId ?? null,
    sourceChartAccountId: record.sourceChartAccountId ?? null,
    offsetAccountId: record.offsetAccountId ?? null,
    currencyId: record.currencyId ?? null,
    note: record.note ?? null,
    lines: (record.lines ?? []).map((line) =>
      createPaymentLine({
        employeeId: line.employeeId,
        employeeName: line.employeeName,
        employeeNumber: line.employeeNumber,
        departmentName: line.departmentName,
        payableAmount: line.payableAmount ?? null,
        amount: line.amount,
        note: line.note ?? null,
      }),
    ),
  };
};

/** To'lov paketining umumiy summasi. */
export const paymentTotal = (lines: PayrollPaymentLineForm[]) =>
  lines.reduce((total, line) => total + (line.amount ?? 0), 0);

/** FINAL payment may select regular docs and separately payable corrections only. */
export const filterDocumentsForFinalPayment = (documents: PayrollDocument[]) =>
  documents.filter((document) =>
    document.documentKind !== "CORRECTION" || document.correctionPayoutMode === "SEPARATE",
  );
