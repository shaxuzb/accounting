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
  salaryExpenseAccountId: Yup.number().nullable(),
  salaryPayableAccountId: Yup.number().nullable(),
  note: Yup.string().nullable(),
  adjustments: Yup.array().of(
    Yup.object({
      employeeId: requiredNumber("payroll.fields.employee"),
      componentId: requiredNumber("payroll.fields.component"),
      amount: Yup.number().nullable(),
      targetAmount: Yup.number().nullable(),
      mode: Yup.string().oneOf(["AMOUNT", "TARGET"]).required(),
      note: Yup.string().nullable(),
    }).test("adjustment-value", () => tMessage("payroll.messages.adjustmentValueRequired"), (value) => {
      if (!value) return false;
      return value.mode === "TARGET" ? value.targetAmount != null : value.amount != null;
    }),
  ),
});
