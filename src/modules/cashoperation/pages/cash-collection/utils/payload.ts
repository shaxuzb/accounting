import type { CashCollectionForm, CashCollectionRequest } from "../types/form";

export const toCashCollectionPayload = (
  values: CashCollectionForm &
    Partial<{ documentRegistryId: unknown; statusId: unknown }>,
): CashCollectionRequest => ({
  cashBoxId: Number(values.cashBoxId),
  bankAccountId: Number(values.bankAccountId),
  docDate: values.docDate,
  currencyId: Number(values.currencyId),
  amount: Number(values.amount),
  exchangeRate: Number(values.exchangeRate || 1),
  cashChartAccountId: values.cashChartAccountId ? Number(values.cashChartAccountId) : null,
  cashInTransitAccountId: values.cashInTransitAccountId ? Number(values.cashInTransitAccountId) : null,
  bankChartAccountId: values.bankChartAccountId ? Number(values.bankChartAccountId) : null,
  comment: values.comment.trim() || "",
});
