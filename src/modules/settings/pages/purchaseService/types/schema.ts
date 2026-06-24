import * as Yup from "yup";
import {
  editStateSchema,
  optionalString,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const purchaseServiceSchema = (isEdit = false) =>
  Yup.object({
    name: requiredString("settings.fields.name"),
    description: optionalString(),
    serviceTypeId: requiredNumber("settings.fields.serviceTypeId"),
    stateId: editStateSchema(isEdit),
  });
