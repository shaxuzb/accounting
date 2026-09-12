import type { PayrollPaymentLineForm } from "../types/form";
import type { PayrollAdvanceSuggestionLine } from "../types/type";

export const mapAdvanceSuggestionToPaymentLines = (
  suggestions: PayrollAdvanceSuggestionLine[],
): PayrollPaymentLineForm[] =>
  suggestions
    .filter((line) => line.suggested > 0)
    .map((line) => ({
      employeeId: line.employeeId,
      employeeName: line.employeeName,
      employeeNumber: line.employeeNumber,
      departmentName: null,
      payableAmount: null,
      amount: line.suggested,
      note: null,
    }));
