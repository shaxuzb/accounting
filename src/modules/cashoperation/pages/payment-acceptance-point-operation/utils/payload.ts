import type { PaymentAcceptancePointOperationForm, PaymentAcceptancePointOperationRequest } from "../types/form";

export const toPaymentAcceptancePointOperationPayload = (
  values: PaymentAcceptancePointOperationForm &
    Partial<{ relatedDocumentId: unknown; statusId: unknown }>,
): PaymentAcceptancePointOperationRequest => ({
  paymentAcceptancePointId: Number(values.paymentAcceptancePointId),
  directionId: values.directionId === 1 ? 1 : -1,
  docDate: values.docDate,
  currencyId: Number(values.currencyId),
  amount: Number(values.amount),
  exchangeRate: Number(values.exchangeRate || 1),
  externalTransactionNumber: values.externalTransactionNumber.trim() || "",
  comment: values.comment.trim() || "",
});
