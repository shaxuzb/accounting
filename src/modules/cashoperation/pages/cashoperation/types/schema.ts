import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";
import type { TFunction } from "i18next";

export const cashOperationSchema = (t: TFunction) =>
  Yup.object({
    cashBoxId: requiredNumber("settings.entities.cashBox"),
    cashChartAccountId: requiredNumber("cash.fields.cashChartAccount").moreThan(
      0,
      t("cash.validation.cashChartAccountRequired"),
    ),
    offsetAccountId: requiredNumber(
      "cash.fields.offsetAccount",
    ).moreThan(0, t("cash.validation.offsetAccountRequired")),
    operationTypeId: requiredNumber("cash.fields.operationType").moreThan(
      0,
      t("cash.validation.operationTypeRequired"),
    ),
    counterpartyId: requiredNumber("settings.entities.counterparty").moreThan(
      0,
      "settings.entities.counterparty",
    ),
    paymentTypeId: requiredNumber("cash.fields.paymentType").moreThan(
      0,
      t("cash.validation.paymentTypeRequired"),
    ),
    docDate: Yup.string().required(t("cash.validation.dateRequired")),
    currencyId: requiredNumber("settings.fields.currency").moreThan(
      0,
      "settings.fields.currency",
    ),
    amount: Yup.number()
      .nullable()
      .moreThan(0, t("cash.validation.amountRequired"))
      .required(t("cash.validation.amountRequired")),
    comment: Yup.string().nullable(),
  });
