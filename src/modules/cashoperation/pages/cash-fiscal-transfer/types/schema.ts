import type { TFunction } from "i18next";
import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const cashFiscalTransferSchema = (t: TFunction) =>
  Yup.object({
    fiscalCashRegisterId: requiredNumber(
      "settings.entities.fiscalCashRegisters",
    ).moreThan(0, t("cash.validation.fiscalCashRegisterRequired")),
    cashBoxId: requiredNumber("settings.entities.cashBox").moreThan(
      0,
      t("cash.validation.cashBoxRequired"),
    ),
    directionId: Yup.number()
      .typeError(t("cash.validation.directionRequired"))
      .oneOf([1, -1], t("cash.validation.directionRequired"))
      .required(t("cash.validation.directionRequired")),
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
