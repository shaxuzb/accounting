import type { RetailSalePaymentForm, RetailSalePaymentPayload } from "../types/form";

const isCashPayment = (payment: RetailSalePaymentForm) => {
  const value = `${payment.paymentMethodCode ?? ""} ${payment.paymentMethodName ?? ""}`.toUpperCase();
  return value.includes("CASH") || value.includes("NAQD") || value.includes("НАЛИЧ");
};

const toPayments = (
  payments: RetailSalePaymentForm[],
): RetailSalePaymentPayload[] =>
  payments.map((payment) => ({
    paymentMethodId: Number(payment.paymentMethodId),
    paymentAcceptancePointId:
      isCashPayment(payment)
        ? null
        : payment.paymentAcceptancePointId
          ? Number(payment.paymentAcceptancePointId)
          : null,
    debitAccountId: Number(payment.debitAccountId),
    amount: Number(payment.amount),
    transactionNumber: payment.transactionNumber.trim() || null,
  }));

export const toRetailSalePaymentPayloads = toPayments;
