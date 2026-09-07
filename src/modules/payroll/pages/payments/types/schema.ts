import {
  requiredNumber,
  requiredString,
  tMessage,
} from "@/modules/settings/shared/validation";
import * as Yup from "yup";

export const payrollPaymentSchema = Yup.object({
  periodId: requiredNumber("payroll.fields.period"),
  paymentKind: requiredString("payroll.fields.paymentKind"),
  payrollDocId: Yup.number()
    .nullable()
    .when("paymentKind", {
      is: "FINAL",
      then: (schema) =>
        schema.required(() => tMessage("payroll.messages.payrollDocRequired")),
    }),
  docDate: requiredString("payroll.fields.docDate"),
  sourceType: requiredString("payroll.fields.sourceType"),
  bankAccountId: Yup.number()
    .nullable()
    .when("sourceType", {
      is: "BANK",
      then: (schema) =>
        schema.required(() => tMessage("payroll.messages.bankAccountRequired")),
    }),
  cashBoxId: Yup.number()
    .nullable()
    .when("sourceType", {
      is: "CASH",
      then: (schema) =>
        schema.required(() => tMessage("payroll.messages.cashBoxRequired")),
    }),
  sourceChartAccountId: requiredNumber("payroll.fields.sourceChartAccount"),
  offsetAccountId: requiredNumber("payroll.fields.offsetAccount"),
  currencyId: requiredNumber("payroll.fields.currency"),
  note: Yup.string().nullable(),
  lines: Yup.array()
    .of(
      Yup.object({
        employeeId: requiredNumber("payroll.fields.employee"),
        amount: requiredNumber("payroll.fields.amount").moreThan(0, () =>
          tMessage("payroll.messages.amountPositive"),
        ),
        note: Yup.string().nullable(),
      }),
    )
    .min(1, () => tMessage("payroll.messages.atLeastOneLine")),
});
