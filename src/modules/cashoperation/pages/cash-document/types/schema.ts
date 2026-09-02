import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";
import type { TFunction } from "i18next";

export const cashDocumentSchema = (t: TFunction) =>
  Yup.object({
    cashBoxId: requiredNumber("settings.entities.cashBox"),
    paymentTypeId: requiredNumber("cash.fields.paymentType").moreThan(
      0,
      t("cash.validation.paymentTypeRequired"),
    ),
    cashChartAccountId: requiredNumber("cash.fields.cashChartAccount").moreThan(
      0,
      t("cash.validation.cashChartAccountRequired"),
    ),
    offsetAccountId: requiredNumber("cash.fields.offsetAccount").moreThan(
      0,
      t("cash.validation.offsetAccountRequired"),
    ),
    // counterpartyId: requiredNumber("settings.entities.counterparty").moreThan(
    //   0,
    //   "settings.entities.counterparty",
    // ),
    docDate: Yup.string().required(t("cash.validation.dateRequired")),
    currencyId: requiredNumber("settings.fields.currency"),
    amount: Yup.number()
      .nullable()
      .moreThan(0, t("cash.validation.amountRequired"))
      .required(t("cash.validation.amountRequired")),
    exchangeRate: Yup.number()
      .nullable()
      .required(t("cash.validation.exchangeRateRequired")),
    comment: Yup.string().nullable(),
  });
