import {
  requiredNumber,
  requiredString,
  tMessage,
} from "@/modules/settings/shared/validation";
import * as Yup from "yup";

export const hrWorkScheduleSchema = Yup.object({
  name: requiredString("hr.fields.scheduleName"),
  effectiveFrom: requiredString("hr.fields.effectiveFrom"),
  effectiveTo: Yup.string()
    .nullable()
    .test("date-range", () => tMessage("hr.messages.dateRangeInvalid"), function (value) {
      return !value || !this.parent.effectiveFrom || value >= this.parent.effectiveFrom;
    }),
  days: Yup.array()
    .of(
      Yup.object({
        dayOfWeek: requiredNumber("hr.fields.dayOfWeek").min(1).max(7),
        workHours: requiredNumber("hr.fields.workHours").min(0).max(24),
      }),
    )
    .min(1, () => tMessage("hr.messages.scheduleDayRequired")),
});
