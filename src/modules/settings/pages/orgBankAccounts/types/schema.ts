import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const orgBankAccountsSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    bankId: requiredNumber("settings.fields.bank"),
    accountNumber: requiredString("settings.fields.accountNumber"),
    currencyId: requiredNumber("settings.fields.currency"),
    isMain: Yup.boolean(),
    stateId: editStateSchema(isEdit),
  });
