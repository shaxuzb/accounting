import type { OpeningBalanceAccountDetail } from "../types/type";
import type {
  OpeningBalanceAccountForm,
  OpeningBalanceAccountPayload,
  OpeningBalanceDetailForm,
} from "../types/form";

let newDetailSequence = 0;

export const createEmptyOpeningBalanceDetail =
  (): OpeningBalanceDetailForm => ({
    clientKey: `new-${Date.now()}-${++newDetailSequence}`,
    id: null,
    debitAmount: null,
    creditAmount: null,
    quantity: null,
    currencyId: 1,
    currencyAmount: null,
    exchangeRate: 1,
    description: "",
    subkontos: [],
  });

export const createEmptyOpeningBalanceAccount =
  (): OpeningBalanceAccountForm => ({
    id: null,
    chartAccountId: null,
    details: [createEmptyOpeningBalanceDetail()],
  });

export const mapOpeningBalanceAccountToForm = (
  account: OpeningBalanceAccountDetail,
): OpeningBalanceAccountForm => ({
  id: account.id,
  chartAccountId: account.chartAccountId,
  details: (account.details ?? []).map((detail) => {
    const debitAmount = Number(detail.debitAmount ?? 0);
    const creditAmount = Number(detail.creditAmount ?? 0);
    const currencyAmount = Number(detail.currencyAmount ?? 0);

    return {
      clientKey: `existing-${detail.id}`,
      id: detail.id,
      debitAmount,
      creditAmount,
      quantity: detail.quantity ?? null,
      currencyId: 1,
      currencyAmount:
        currencyAmount > 0
          ? currencyAmount
          : debitAmount || creditAmount,
      exchangeRate: 1,
      description: detail.description ?? "",
      subkontos: (detail.subkontos ?? []).map((subkonto) => ({
        subkontoTypeId: subkonto.subkontoTypeId,
        subkontoId: subkonto.subkontoId,
      })),
    };
  }),
});

export const toOpeningBalanceAccountPayload = (
  values: OpeningBalanceAccountForm,
): OpeningBalanceAccountPayload => ({
  id: Number(values.id) > 0 ? Number(values.id) : null,
  chartAccountId: Number(values.chartAccountId),
  details: values.details.map((detail) => {
    const debitAmount = Number(detail.debitAmount ?? 0);
    const creditAmount = Number(detail.creditAmount ?? 0);

    return {
      id: Number(detail.id) > 0 ? Number(detail.id) : null,
      debitAmount,
      creditAmount,
      quantity: Number(detail.quantity ?? 0),
      currencyId: 1,
      currencyAmount: Number(
        detail.currencyAmount ?? (debitAmount || creditAmount),
      ),
      exchangeRate: 1,
      description: detail.description?.trim() ?? "",
      subkontos: detail.subkontos
        .filter((subkonto) => Number(subkonto.subkontoId) > 0)
        .map((subkonto) => ({
          subkontoTypeId: Number(subkonto.subkontoTypeId),
          subkontoId: Number(subkonto.subkontoId),
        })),
    };
  }),
});

export const calculateOpeningBalanceTotals = (
  details: OpeningBalanceDetailForm[],
) => {
  const debit = details.reduce(
    (total, detail) => total + Number(detail.debitAmount ?? 0),
    0,
  );
  const credit = details.reduce(
    (total, detail) => total + Number(detail.creditAmount ?? 0),
    0,
  );
  const difference = debit - credit;

  return {
    debit,
    credit,
    balanceSide:
      difference > 0 ? ("debit" as const) : difference < 0 ? ("credit" as const) : null,
    balance: Math.abs(difference),
  };
};
