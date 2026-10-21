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
  tin: Yup.string()
    .nullable()
    .matches(/^\d{9}$/, { message: tMessage("settings.validation.inn9"), excludeEmptyString: true }),
  birthDate: Yup.string().nullable(),
  phoneNumber: Yup.string().nullable(),
  email: Yup.string()
    .nullable()
    .email(() => tMessage("validation.invalidEmail")),
  // a card (16 digits) or a bank account (20), typed with spaces
  bankAccountNumber: Yup.string()
    .nullable()
    .test("card-or-account", () => tMessage("settings.validation.cardOrAccount"), (value) => {
      const digits = (value ?? "").replace(/[\s-]/g, "");
      return !digits || /^(\d{16}|\d{20})$/.test(digits);
    }),
});
