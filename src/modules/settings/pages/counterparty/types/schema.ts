import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredPhone,
  requiredString,
} from "../../../shared/validation";

export const counterpartySchema = (isEdit = false) =>
  Yup.object({
    isVatPayer: Yup.boolean().required(),
    fullName: requiredString("settings.fields.fullName"),
    shortName: requiredString("settings.fields.shortName"),
    inn: requiredString("settings.fields.inn"),
    phoneNumber: requiredPhone(),
    regionId: requiredNumber("settings.fields.region"),
    districtId: requiredNumber("settings.fields.district"),
    stateId: editStateSchema(isEdit),
  });
