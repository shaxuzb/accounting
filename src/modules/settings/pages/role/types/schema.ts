import * as Yup from "yup";
import {
  editStateSchema,
  requiredString,
  validationMessage,
} from "../../../shared/validation";

export const roleSchema = (isEdit = false) =>
  Yup.object({
    fullName: requiredString("settings.fields.fullName"),
    shortName: requiredString("settings.fields.shortName"),
    moduleIds: Yup.array()
      .of(Yup.number().required())
      .min(1, validationMessage.minArray("settings.fields.modules", 1))
      .required(validationMessage.required("settings.fields.modules")),
    stateId: editStateSchema(isEdit),
  });
