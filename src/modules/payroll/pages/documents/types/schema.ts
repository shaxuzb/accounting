import {
  requiredNumber,
  requiredString,
  tMessage,
} from "@/modules/settings/shared/validation";
import * as Yup from "yup";

export const payrollCalculateSchema = Yup.object({
  periodId: requiredNumber("payroll.fields.period"),
  docDate: requiredString("payroll.fields.docDate"),
  documentKind: requiredString("payroll.fields.documentKind"),
  correctionOfDocId: Yup.number()
    .nullable()
    .when("documentKind", {
      is: "CORRECTION",
      then: (schema) =>
        schema.required(() => tMessage("payroll.messages.correctionDocRequired")),
    }),
  note: Yup.string().nullable(),
  adjustments: Yup.array().of(
    Yup.object({
      employeeId: requiredNumber("payroll.fields.employee"),
      componentId: requiredNumber("payroll.fields.component"),
      amount: requiredNumber("payroll.fields.amount"),
      note: Yup.string().nullable(),
    }),
  ),
});
