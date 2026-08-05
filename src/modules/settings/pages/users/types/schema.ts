import * as Yup from "yup";
import {
  editStateSchema,
  requiredEmail,
  requiredNumber,
  requiredPassword,
  requiredPhone,
  requiredString,
  validationMessage,
} from "../../../shared/validation";

const optionalPassword = Yup.string().test(
  "optional-password-length",
  () => validationMessage.minString("settings.fields.password", 6),
  (value) => !value || value.length >= 6,
);

export const createUserSchema = (isEdit: boolean) =>
  Yup.object({
    userName: requiredString("settings.fields.userName"),
    phoneNumber: requiredPhone(),
    email: requiredEmail(),
    firstName: requiredString("settings.fields.firstName"),
    lastName: requiredString("settings.fields.lastName"),
    password: isEdit ? optionalPassword : requiredPassword(),
    stateId: editStateSchema(isEdit),
    organizations: Yup.array()
      .of(
        Yup.object({
          organizationId: requiredNumber("settings.fields.organization"),
          roleId: requiredNumber("settings.fields.role"),
          isDefault: Yup.boolean().required(),
          isOwner: Yup.boolean().required(),
        }),
      )
      .min(1, validationMessage.minArray("settings.fields.organization", 1))
      .required(validationMessage.required("settings.fields.organization")),
  });
