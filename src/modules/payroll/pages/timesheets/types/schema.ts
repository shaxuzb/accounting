import {
  requiredNumber,
  requiredString,
  tMessage,
} from "@/modules/settings/shared/validation";
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
        normWorkDays: nonNegative("payroll.fields.normWorkDays").max(31),
        normWorkHours: nonNegative("payroll.fields.normWorkHours"),
        workedDays: nonNegative("payroll.fields.workedDays").max(31, () =>
          tMessage("payroll.messages.daysRange"),
        ),
        workedHours: nonNegative("payroll.fields.workedHours"),
        leaveDays: nonNegative("payroll.fields.leaveDays"),
        sickDays: nonNegative("payroll.fields.sickDays"),
        absentDays: nonNegative("payroll.fields.absentDays"),
        overtimeHours: nonNegative("payroll.fields.overtimeHours"),
        note: Yup.string().nullable(),
      }),
    )
    .min(1, () => tMessage("payroll.messages.atLeastOneLine")),
});
