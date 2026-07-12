import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const cashOperationSchema = () =>
  Yup.object({
    cashBoxId: requiredNumber("settings.entities.cashBox"),
    cashChartAccountId: requiredNumber("Kassa schyotini tanlang").moreThan(
      0,
      "Kassa schyotini tanlang",
    ),
    offsetAccountId: requiredNumber(
      "Qarama-qarshi schyotni tanlang",
    ).moreThan(0, "Qarama-qarshi schyotni tanlang"),
    operationTypeId: requiredNumber("Operatsiya turini tanlang").moreThan(
      0,
      "Operatsiya turini tanlang",
    ),
    counterpartyId: requiredNumber("settings.entities.counterparty").moreThan(
      0,
      "settings.entities.counterparty",
    ),
    paymentTypeId: requiredNumber("To'lov turini tanlang").moreThan(
      0,
      "To'lov turini tanlang",
    ),
    docDate: Yup.string().required(),
    currencyId: requiredNumber("settings.fields.currency").moreThan(
      0,
      "settings.fields.currency",
    ),
    amount: Yup.number().nullable().moreThan(0).required(),
    comment: Yup.string().nullable(),
  });
