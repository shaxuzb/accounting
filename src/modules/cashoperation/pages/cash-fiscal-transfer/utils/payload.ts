import type { CashFiscalTransferForm, CashFiscalTransferRequest } from "../types/form";

export const toCashFiscalTransferPayload = (
  values: CashFiscalTransferForm &
    Partial<{ docNumber: unknown; statusId: unknown; stateId: unknown }>,
): CashFiscalTransferRequest => ({
  fiscalCashRegisterId: Number(values.fiscalCashRegisterId),
  cashBoxId: Number(values.cashBoxId),
  directionId: values.directionId === 1 ? 1 : -1,
  docDate: values.docDate,
  currencyId: Number(values.currencyId),
  amount: Number(values.amount),
  exchangeRate: Number(values.exchangeRate || 1),
  fiscalCashAccountId: values.fiscalCashAccountId ? Number(values.fiscalCashAccountId) : null,
  cashBoxAccountId: values.cashBoxAccountId ? Number(values.cashBoxAccountId) : null,
  comment: values.comment.trim() || "",
});
