import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const warehouseSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    branchId: requiredNumber("settings.fields.branch"),
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    responsibleUserId: requiredNumber("settings.fields.responsibleUser"),
    stateId: editStateSchema(isEdit),
  });
