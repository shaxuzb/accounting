import * as Yup from "yup";
import {
  editStateSchema,
  optionalString,
  requiredString,
} from "../../../shared/validation";

export const settingsBankSchema = (isEdit = false) =>
  Yup.object({
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    mfo: optionalString(),
    stateId: editStateSchema(isEdit),
  });
