import * as Yup from "yup";
import {
  editStateSchema,
  requiredEmail,
  requiredNumber,
  requiredPassword,
  requiredPhone,
  requiredString,
} from "../../../shared/validation";

export const userSchema = Yup.object({
  userName: requiredString("settings.fields.userName"),
  phoneNumber: requiredPhone(),
  email: requiredEmail(),
  firstName: requiredString("settings.fields.firstName"),
  lastName: requiredString("settings.fields.lastName"),
  roleId: requiredNumber("settings.fields.role"),
  password: requiredPassword(),
  stateId: editStateSchema(false),
});
