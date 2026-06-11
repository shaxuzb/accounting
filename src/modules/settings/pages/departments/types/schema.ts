import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const departmentsSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    branchId: requiredNumber("settings.fields.branch"),
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    stateId: editStateSchema(isEdit),
  });
