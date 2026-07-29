import * as Yup from "yup";
import {
  requiredNumber,
  requiredString,
  tMessage,
} from "../../../shared/validation";

const dateRangeTest = (
  fromField: string,
  message = "payroll.messages.dateRangeInvalid",
) =>
  Yup.string()
    .nullable()
    .test("date-range", () => tMessage(message), function (value) {
      const from = (this.parent as Record<string, string | undefined>)[
        fromField
      ];
      if (!value || !from) return true;
      return new Date(value).getTime() >= new Date(from).getTime();
    });

export const employmentSchema = Yup.object({
  departmentId: Yup.number().nullable(),
  positionId: Yup.number().nullable(),
  employmentType: requiredString("payroll.fields.employmentType"),
  startDate: requiredString("payroll.fields.startDate"),
  endDate: dateRangeTest("startDate"),
  monthlySalary: requiredNumber("payroll.fields.monthlySalary").min(0, () =>
    tMessage("payroll.messages.notNegative"),
  ),
  employmentRate: requiredNumber("payroll.fields.employmentRate")
    .moreThan(0, () => tMessage("payroll.messages.rateRange"))
    .max(2, () => tMessage("payroll.messages.rateRange")),
  weeklyHours: requiredNumber("payroll.fields.weeklyHours")
    .moreThan(0, () => tMessage("payroll.messages.weeklyHoursRange"))
    .max(168, () => tMessage("payroll.messages.weeklyHoursRange")),
  currencyId: requiredNumber("payroll.fields.currency"),
  expenseAccountId: Yup.number().nullable(),
});

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

export const employeeCreateSchema = employeeMainSchema.shape({
  employment: employmentSchema,
});

export const employeeComponentSchema = Yup.object({
  componentId: requiredNumber("payroll.fields.component"),
  amount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  rate: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  effectiveFrom: requiredString("payroll.fields.effectiveFrom"),
  effectiveTo: dateRangeTest("effectiveFrom", "payroll.messages.effectiveRangeInvalid"),
  note: Yup.string().nullable(),
});
