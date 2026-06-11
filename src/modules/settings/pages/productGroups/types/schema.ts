import * as Yup from "yup";
import {
  editStateSchema,
  optionalNumber,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const productGroupsSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    parentId: optionalNumber(),
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    stateId: editStateSchema(isEdit),
  });
