import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const cashDocumentSchema = Yup.object({
  cashBoxId: requiredNumber("settings.entities.cashBox"),
  paymentPurposeId: requiredNumber("To'lov maqsadini tanlang"),
  docDate: Yup.string().required(),
  currencyId: requiredNumber("settings.fields.currency"),
  amount: Yup.number().nullable().required("Summani kiriting"),
  exchangeRate: Yup.number().nullable().required("Kursni kiriting"),
  comment: Yup.string().nullable(),
});
