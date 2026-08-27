import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const counterpartybankaccountSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    counterpartyId: requiredNumber("settings.fields.counterparty"),
    bankId: requiredNumber("settings.fields.bank"),
    bankBranchId: Yup.number().nullable(),
    accountNumber: requiredString("settings.fields.accountNumber"),
    currencyId: requiredNumber("settings.fields.currency"),
    isMain: Yup.boolean(),
    stateId: editStateSchema(isEdit),
  });
