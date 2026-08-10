import * as Yup from "yup";
import {
  editStateSchema,
  optionalString,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const bankTerminalSchema = (isEdit = false) =>
  Yup.object({
    bankAccountId: requiredNumber("settings.fields.bankAccount"),
    name: requiredString("settings.fields.name"),
    merchantId: optionalString(),
    externalTerminalId: optionalString(),
    serialNumber: optionalString(),
    stateId: editStateSchema(isEdit),
  });
