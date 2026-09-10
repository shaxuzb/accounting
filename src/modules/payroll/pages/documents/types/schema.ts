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
  correctionPayoutMode: Yup.string()
    .oneOf(["WITH_SALARY", "WITH_ADVANCE", "SEPARATE"])
    .required(),
  salaryExpenseAccountId: requiredNumber("payroll.fields.salaryExpenseAccount").moreThan(
    0,
    () => tMessage("payroll.messages.accountRequired"),
  ),
  salaryPayableAccountId: requiredNumber("payroll.fields.salaryPayableAccount").moreThan(
    0,
    () => tMessage("payroll.messages.accountRequired"),
  ),
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
