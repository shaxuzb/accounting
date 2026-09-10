export interface PayrollReconciliationInput {
  payableAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export const payrollReconciliationVariance = ({
  payableAmount,
  paidAmount,
  outstandingAmount,
}: PayrollReconciliationInput): number =>
  Math.round((payableAmount - paidAmount - outstandingAmount) * 100) / 100;

export const payrollAttendanceTotal = (
  values: Array<number | null | undefined>,
): number =>
  Math.round(values.reduce((sum, value) => sum + (value ?? 0), 0) * 100) / 100;
