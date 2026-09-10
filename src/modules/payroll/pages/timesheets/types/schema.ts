import {
  requiredNumber,
  requiredString,
  tMessage,
} from "@/modules/settings/shared/validation";
import dayjs from "dayjs";
import * as Yup from "yup";

const nonNegative = (fieldKey: string) =>
  requiredNumber(fieldKey).min(0, () => tMessage("payroll.messages.notNegative"));

export const payrollTimesheetSchema = Yup.object({
  periodId: requiredNumber("payroll.fields.period"),
  docDate: requiredString("payroll.fields.docDate"),
  note: Yup.string().nullable(),
  lines: Yup.array()
    .of(
      Yup.object({
        employeeId: requiredNumber("payroll.fields.employee"),
        overtimeHours: nonNegative("payroll.fields.overtimeHours"),
        note: Yup.string().nullable(),
        days: Yup.array()
          .of(Yup.object({
            date: requiredString("payroll.fields.date").test(
              "valid-date",
              () => tMessage("payroll.messages.invalidDate"),
              (value) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value, "YYYY-MM-DD", true).isValid()),
            ),
            statusCode: requiredString("payroll.fields.attendanceStatus"),
            absenceTypeId: Yup.number().nullable(),
          }))
          .min(1, () => tMessage("payroll.messages.daysRequired"))
          .test("unique-days", () => tMessage("payroll.messages.daysUnique"), (days) => {
            if (!days) return false;
            const dates = days.map((day) => day?.date);
            return new Set(dates).size === dates.length;
          }),
      }),
    )
    .min(1, () => tMessage("payroll.messages.atLeastOneLine")),
});
