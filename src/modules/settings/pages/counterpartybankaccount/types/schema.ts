import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const counterpartybankaccountSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    counterpartyId: requiredNumber("settings.fields.counterparty"),
    bankId: requiredNumber("settings.fields.bank"),
    bankBranchId: Yup.number().nullable(),
    accountNumber: requiredString("settings.fields.accountNumber").matches(/^\d{20}$/, tMessage("settings.validation.account20")),
    currencyId: requiredNumber("settings.fields.currency"),
    isMain: Yup.boolean(),
    stateId: editStateSchema(isEdit),
  });
