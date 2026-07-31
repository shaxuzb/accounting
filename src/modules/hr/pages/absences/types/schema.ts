import {
  requiredNumber,
  requiredString,
  tMessage,
} from "@/modules/settings/shared/validation";
import * as Yup from "yup";

export const hrAbsenceSchema = Yup.object({
  employeeId: requiredNumber("hr.fields.employee"),
  absenceTypeId: requiredNumber("hr.fields.absenceType"),
  startDate: requiredString("hr.fields.dateFrom"),
  endDate: requiredString("hr.fields.dateTo").test(
    "date-range",
    () => tMessage("hr.messages.dateRangeInvalid"),
    function (value) {
      return !value || !this.parent.startDate || value >= this.parent.startDate;
    },
  ),
  note: Yup.string().nullable().max(1000),
});
