import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
} from "@/modules/settings/shared/validation";

export const cashOperationSchema = (isEdit = false) =>
  Yup.object({
    cashBoxId: requiredNumber("settings.entities.cashBox"),
    counterpartyId: requiredNumber("settings.entities.counterparty"),
    docDate: Yup.string().required(),
    currencyId: requiredNumber("settings.fields.currency"),
    amount: Yup.number().nullable().required(),
    comment: Yup.string().nullable(),
    stateId: editStateSchema(isEdit),
  });
