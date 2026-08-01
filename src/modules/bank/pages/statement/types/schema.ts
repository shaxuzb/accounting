import * as Yup from "yup";
import type { TFunction } from "i18next";

export const createBankOperationSchema = (t: TFunction) => Yup.object({
  bankAccountId: Yup.number()
    .nullable()
    .required(t("bank.validation.bankAccountRequired"))
    .moreThan(0, t("bank.validation.bankAccountRequired")),
  bankChartAccountId: Yup.number()
    .nullable()
    .required(t("bank.validation.bankChartAccountRequired"))
    .moreThan(0, t("bank.validation.bankChartAccountRequired")),
  offsetAccountId: Yup.number()
    .nullable()
    .required(t("bank.validation.offsetAccountRequired"))
    .moreThan(0, t("bank.validation.offsetAccountRequired")),
  operationTypeId: Yup.number()
    .nullable()
    .required(t("bank.validation.operationTypeRequired"))
    .moreThan(0, t("bank.validation.operationTypeRequired")),
  paymentTypeId: Yup.number()
    .nullable()
    .required(t("bank.validation.paymentTypeRequired"))
    .moreThan(0, t("bank.validation.paymentTypeRequired")),
  counterpartyId: Yup.number()
    .nullable()
    .required(t("bank.validation.counterpartyRequired"))
    .moreThan(0, t("bank.validation.counterpartyRequired")),
  counterpartyBankAccountId: Yup.number().nullable(),
  contractId: Yup.number().nullable(),
  exchangeRate: Yup.number().nullable(),
  docDate: Yup.string().required(),
  currencyId: Yup.number()
    .nullable()
    .required(t("bank.validation.currencyRequired"))
    .moreThan(0, t("bank.validation.currencyRequired")),
  amount: Yup.number().nullable().moreThan(0).required(),
  comment: Yup.string().trim().nullable(),
  stateId: Yup.number().nullable(),
});
