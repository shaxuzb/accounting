import type { CashOperationForm } from "../types/form";
import type { CashOperation } from "../types/type";

export const getCashOperationInitialValues = (
  record?: Partial<CashOperation> | null,
  fallback: Partial<CashOperationForm> = {},
): CashOperationForm => ({
  cashBoxId: record?.cashBoxId ?? fallback.cashBoxId ?? null,
  cashChartAccountId:
    record?.cashChartAccountId ?? fallback.cashChartAccountId ?? null,
  offsetAccountId: record?.offsetAccountId ?? fallback.offsetAccountId ?? null,
  cashOperationId: record?.cashOperationId ?? fallback.cashOperationId ?? null,
  operationTypeId: record?.operationTypeId ?? fallback.operationTypeId ?? null,
  paymentTypeId: record?.paymentTypeId ?? fallback.paymentTypeId ?? null,
  counterpartyId: record?.counterpartyId ?? fallback.counterpartyId ?? null,
  contractId: record?.contractId ?? fallback.contractId ?? null,
  docDate: record?.docDate ?? fallback.docDate ?? "",
  currencyId: record?.currencyId ?? fallback.currencyId ?? null,
  amount: record?.amount ?? fallback.amount ?? null,
  comment: record?.comment ?? fallback.comment ?? "",
  stateId: record?.stateId ?? fallback.stateId ?? null,
});
