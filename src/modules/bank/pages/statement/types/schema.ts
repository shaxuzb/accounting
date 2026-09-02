import * as Yup from "yup";
import type { TFunction } from "i18next";

export const createBankOperationSchema = (t: TFunction) =>
  Yup.object({
    bankAccountId: Yup.number()
      .nullable()
      .required(t("bank.validation.bankAccountRequired"))
      .moreThan(0, t("bank.validation.bankAccountRequired")),
    directionId: Yup.number()
      .nullable()
      .required(t("bank.validation.operationTypeRequired"))
      .oneOf([1, -1], t("bank.validation.operationTypeRequired")),
    bankChartAccountId: Yup.number().nullable(),
    offsetAccountId: Yup.number().nullable(),
    paymentTypeId: Yup.number().nullable(),
    counterpartyId: Yup.number().nullable(),
    counterpartyBankAccountId: Yup.number().nullable(),
    contractId: Yup.number().nullable(),
    relatedDocumentId: Yup.number().nullable(),
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
