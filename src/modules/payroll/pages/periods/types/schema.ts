import { requiredNumber, tMessage } from "@/modules/settings/shared/validation";
import * as Yup from "yup";

export const payrollPeriodSchema = Yup.object({
  year: requiredNumber("payroll.fields.year")
    .min(2000, () => tMessage("payroll.messages.yearRange"))
    .max(2200, () => tMessage("payroll.messages.yearRange")),
  month: requiredNumber("payroll.fields.month")
    .min(1, () => tMessage("payroll.messages.monthRange"))
    .max(12, () => tMessage("payroll.messages.monthRange")),
  normWorkDays: requiredNumber("payroll.fields.normWorkDays").moreThan(0, () =>
    tMessage("payroll.messages.positiveNumber"),
  ),
  normWorkHours: requiredNumber("payroll.fields.normWorkHours").moreThan(0, () =>
    tMessage("payroll.messages.positiveNumber"),
  ),
});
