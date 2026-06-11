import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredPhone,
  requiredString,
} from "../../../shared/validation";

export const organizationsSchema = (isEdit = false) =>
  Yup.object({
    fullName: requiredString("settings.fields.fullName"),
    shortName: requiredString("settings.fields.shortName"),
    inn: requiredString("settings.fields.inn"),
    phoneNumber: requiredPhone(),
    regionId: requiredNumber("settings.fields.region"),
    defaultLanguageId: requiredNumber("settings.fields.language"),
    director: requiredString("settings.fields.director"),
    address: requiredString("settings.fields.address"),
    isParent: Yup.boolean(),
    stateId: editStateSchema(isEdit),
  });
