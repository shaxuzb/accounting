import * as Yup from "yup";

// as the 1C card checks it: a resident's STIR is 9 digits, a PINFL 14; a legal entity has a STIR,
// a person or an entrepreneur at least one of the two; a non-resident's foreign number is free
const LEGAL = 1;
import {
  editStateSchema,
  requiredNumber,
  requiredPhone,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const counterpartySchema = (isEdit = false) =>
  Yup.object({
    isVatPayer: Yup.boolean().required(),
    fullName: requiredString("settings.fields.fullName"),
    shortName: requiredString("settings.fields.shortName"),
    kindId: Yup.number().required(),
    isResident: Yup.boolean(),
    inn: Yup.string()
      .nullable()
      .when(["kindId", "isResident", "pinfl"], ([kindId, isResident, pinfl], schema) => {
        if (!isResident) return schema;
        const nine = schema.matches(/^\d{9}$/, { message: tMessage("settings.validation.inn9"), excludeEmptyString: true });
        if (kindId === LEGAL) return nine.required(tMessage("settings.validation.inn9"));
        return pinfl ? nine : nine.required(tMessage("settings.validation.innOrPinfl"));
      }),
    pinfl: Yup.string()
      .nullable()
      .when(["kindId", "isResident"], ([kindId, isResident], schema) =>
        kindId === LEGAL || !isResident
          ? schema
          : schema.matches(/^\d{14}$/, { message: tMessage("settings.validation.pinfl14"), excludeEmptyString: true }),
      ),
    // a resident VAT payer's registration code (12 digits) and the activity code (5)
    vatRegistrationCode: Yup.string()
      .nullable()
      .when(["isResident", "isVatPayer"], ([isResident, isVatPayer], schema) =>
        isResident && isVatPayer
          ? schema.matches(/^\d{12}$/, { message: tMessage("settings.validation.vatCode12"), excludeEmptyString: true })
          : schema,
      ),
    oked: Yup.string()
      .nullable()
      .when(["isResident"], ([isResident], schema) =>
        isResident ? schema.matches(/^\d{5}$/, { message: tMessage("settings.validation.oked5"), excludeEmptyString: true }) : schema,
      ),
    phoneNumber: requiredPhone(),
    regionId: requiredNumber("settings.fields.region"),
    districtId: requiredNumber("settings.fields.district"),
    stateId: editStateSchema(isEdit),
  });
