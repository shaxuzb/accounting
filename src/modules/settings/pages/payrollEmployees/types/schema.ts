import * as Yup from "yup";
import {
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const employeeMainSchema = Yup.object({
  employeeNumber: requiredString("payroll.fields.employeeNumber").max(
    50,
    () => tMessage("payroll.messages.employeeNumberMax"),
  ),
  firstName: requiredString("settings.fields.firstName").max(150),
  lastName: requiredString("settings.fields.lastName").max(150),
  middleName: Yup.string().nullable(),
  pinfl: Yup.string()
    .nullable()
    .test("pinfl-length", () => tMessage("payroll.messages.pinflLength"), (value) =>
      !value ? true : value.replace(/\D/g, "").length === 14,
    ),
  tin: Yup.string().nullable(),
  birthDate: Yup.string().nullable(),
  phoneNumber: Yup.string().nullable(),
  email: Yup.string()
    .nullable()
    .email(() => tMessage("validation.invalidEmail")),
  bankAccountNumber: Yup.string().nullable(),
});
