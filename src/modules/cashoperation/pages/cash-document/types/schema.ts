import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const cashDocumentSchema = Yup.object({
  cashBoxId: requiredNumber("settings.entities.cashBox"),
  paymentTypeId: requiredNumber("To'lov turini tanlang").moreThan(
    0,
    "To'lov turini tanlang",
  ),
  cashChartAccountId: requiredNumber("Kassa schyotini tanlang").moreThan(
    0,
    "Kassa schyotini tanlang",
  ),
  offsetAccountId: requiredNumber(
    "Qarama-qarshi schyotni tanlang",
  ).moreThan(0, "Qarama-qarshi schyotni tanlang"),
  counterpartyId: requiredNumber("settings.entities.counterparty").moreThan(
    0,
    "settings.entities.counterparty",
  ),
  docDate: Yup.string().required(),
  currencyId: requiredNumber("settings.fields.currency"),
  amount: Yup.number()
    .nullable()
    .moreThan(0, "Summani kiriting")
    .required("Summani kiriting"),
  exchangeRate: Yup.number().nullable().required("Kursni kiriting"),
  comment: Yup.string().nullable(),
});
