import * as Yup from "yup";
import {
  editStateSchema,
  optionalString,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const settingsBankSchema = (isEdit = false) =>
  Yup.object({
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    // the 5-digit code the Central Bank gives a bank and its branches
    mfo: optionalString().matches(/^\d{5}$/, { message: tMessage("settings.validation.mfo5"), excludeEmptyString: true }),
    stateId: editStateSchema(isEdit),
  });
