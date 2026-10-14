import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const orgBankAccountsSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    bankId: requiredNumber("settings.fields.bank"),
    bankBranchId: Yup.number().nullable(),
    // an Uzbek account: 20 digits, the currency inside (checked by the server)
    accountNumber: requiredString("settings.fields.accountNumber").matches(/^\d{20}$/, tMessage("settings.validation.account20")),
    currencyId: requiredNumber("settings.fields.currency"),
    isMain: Yup.boolean(),
    stateId: editStateSchema(isEdit),
  });
