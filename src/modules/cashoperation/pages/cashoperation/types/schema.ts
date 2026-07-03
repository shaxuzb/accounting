import * as Yup from "yup";
import { requiredNumber } from "@/modules/settings/shared/validation";

export const cashOperationSchema = () =>
  Yup.object({
    cashBoxId: requiredNumber("settings.entities.cashBox"),
    counterpartyId: requiredNumber("settings.entities.counterparty"),
    docDate: Yup.string().required(),
    currencyId: requiredNumber("settings.fields.currency"),
    amount: Yup.number().nullable().required(),
    comment: Yup.string().nullable(),
  });
