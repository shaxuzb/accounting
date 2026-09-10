import { requiredNumber, tMessage } from "@/modules/settings/shared/validation";
import * as Yup from "yup";

export const payrollPeriodSchema = Yup.object({
  year: requiredNumber("payroll.fields.year")
    .min(2000, () => tMessage("payroll.messages.yearRange"))
    .max(2200, () => tMessage("payroll.messages.yearRange")),
  month: requiredNumber("payroll.fields.month")
    .min(1, () => tMessage("payroll.messages.monthRange"))
    .max(12, () => tMessage("payroll.messages.monthRange")),
  dailyWorkHours: requiredNumber("payroll.fields.dailyWorkHours")
    .moreThan(0, () => tMessage("payroll.messages.positiveNumber"))
    .max(24, () => tMessage("payroll.messages.dailyWorkHoursRange")),
  workDates: Yup.array()
    .of(Yup.string().required())
    .min(1, () => tMessage("payroll.messages.workDatesRequired"))
    .test(
      "unique-work-dates",
      () => tMessage("payroll.messages.workDatesUnique"),
      (dates) => new Set(dates ?? []).size === (dates?.length ?? 0),
    )
    .test(
      "work-dates-in-period",
      () => tMessage("payroll.messages.workDatesInPeriod"),
      function validateWorkDates(dates) {
        const { year, month } = this.parent as {
          year?: number | null;
          month?: number | null;
        };
        if (!year || !month) return true;
        const prefix = `${year}-${String(month).padStart(2, "0")}-`;
        return (dates ?? []).every((date) => date.startsWith(prefix));
      },
    ),
});
