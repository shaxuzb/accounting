import type { TFunction } from "i18next";
import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const cashCollectionSchema = (t: TFunction) =>
  Yup.object({
    cashBoxId: requiredNumber("settings.entities.cashBox").moreThan(
      0,
      t("cash.validation.cashBoxRequired"),
    ),
    bankAccountId: requiredNumber("bank.fields.bankAccount").moreThan(
      0,
      t("cash.validation.bankAccountRequired"),
    ),
    docDate: Yup.string().required(t("cash.validation.dateRequired")),
    currencyId: requiredNumber("settings.fields.currency").moreThan(
      0,
      t("cash.validation.currencyRequired"),
    ),
    amount: requiredNumber("cash.fields.amount").moreThan(
      0,
      t("cash.validation.amountRequired"),
    ),
    exchangeRate: requiredNumber("cash.fields.exchangeRate").moreThan(
      0,
      t("cash.validation.exchangeRateRequired"),
    ),
  });
