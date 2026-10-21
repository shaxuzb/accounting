import * as Yup from "yup";
import {
  editStateSchema,
  requiredNumber,
  requiredPhone,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const organizationsSchema = (isEdit = false) =>
  Yup.object({
    fullName: requiredString("settings.fields.fullName"),
    shortName: requiredString("settings.fields.shortName"),
    inn: requiredString("settings.fields.inn").matches(/^\d{9}$/, tMessage("settings.validation.inn9")),
    // an individual entrepreneur (YaTT) has a PINFL beside the STIR
    pinfl: Yup.string()
      .nullable()
      .when("legalFormId", ([legalFormId], schema) =>
        legalFormId === 7
          ? schema.matches(/^\d{14}$/, { message: tMessage("settings.validation.pinfl14"), excludeEmptyString: true })
          : schema,
      ),
    vatRegistrationCode: Yup.string()
      .nullable()
      .matches(/^\d{12}$/, { message: tMessage("settings.validation.vatCode12"), excludeEmptyString: true }),
    oked: Yup.string()
      .nullable()
      .matches(/^\d{5}$/, { message: tMessage("settings.validation.oked5"), excludeEmptyString: true }),
    phoneNumber: requiredPhone(),
    regionId: requiredNumber("settings.fields.region"),
    defaultLanguageId: requiredNumber("settings.fields.language"),
    // on edit the director comes from the responsible persons below
    director: isEdit ? Yup.string().nullable() : requiredString("settings.fields.director"),
    address: requiredString("settings.fields.address"),
    isParent: Yup.boolean(),
    stateId: editStateSchema(isEdit),
  });
