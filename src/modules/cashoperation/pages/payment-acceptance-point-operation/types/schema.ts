import type { TFunction } from "i18next";
import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const paymentAcceptancePointOperationSchema = (t: TFunction) =>
  Yup.object({
    paymentAcceptancePointId: requiredNumber(
      "app.menu.paymentAcceptancePoints",
    ).moreThan(0, t("cash.validation.paymentAcceptancePointRequired")),
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
