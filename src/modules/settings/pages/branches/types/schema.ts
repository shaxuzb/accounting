import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredPhone,
  requiredString,
} from "../../../shared/validation";

export const branchesSchema = (isEdit = false) =>
  Yup.object({
    organizationId: requiredNumber("settings.fields.organization"),
    code: requiredString("settings.fields.code"),
    name: requiredString("settings.fields.name"),
    regionId: requiredNumber("settings.fields.region"),
    districtId: requiredNumber("settings.fields.district"),
    phoneNumber: requiredPhone(),
    stateId: editStateSchema(isEdit),
  });
