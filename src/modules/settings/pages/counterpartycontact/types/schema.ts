import * as Yup from "yup";
import {
  editStateSchema,
  optionalString,
  requiredEmail,
  requiredNumber,
  requiredPhone,
  requiredString,
} from "../../../shared/validation";

export const counterpartyContactSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    counterpartyId: requiredNumber("settings.fields.counterparty"),
    fullName: requiredString("settings.fields.fullName"),
    phoneNumber: requiredPhone(),
    email: requiredEmail(),
    position: optionalString(),
    comment: optionalString(),
    stateId: editStateSchema(isEdit),
  });
