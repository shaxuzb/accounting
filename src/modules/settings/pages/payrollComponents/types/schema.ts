import * as Yup from "yup";
import {
  requiredNumber,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const payrollComponentSchema = Yup.object({
  code: requiredString("payroll.fields.componentCode"),
  name: requiredString("payroll.fields.componentName"),
  componentType: requiredString("payroll.fields.componentType"),
  calculationMethod: requiredString("payroll.fields.calculationMethod"),
  defaultAmount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  defaultRate: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  isMandatory: Yup.boolean().required(),
  expenseAccountId: Yup.number()
    .nullable()
    .when("componentType", {
      is: "RECLASSIFICATION",
      then: (schema) =>
        schema
          .required(() => tMessage("payroll.messages.accountRequired"))
          .moreThan(0, () => tMessage("payroll.messages.accountRequired")),
    }),
  liabilityAccountId: Yup.number()
    .nullable()
    .when("componentType", {
      is: "RECLASSIFICATION",
      then: (schema) =>
        schema
          .required(() => tMessage("payroll.messages.accountRequired"))
          .moreThan(0, () => tMessage("payroll.messages.accountRequired")),
    }),
  effectiveFrom: requiredString("payroll.fields.effectiveFrom"),
  effectiveTo: Yup.string()
    .nullable()
    .test(
      "effective-range",
      () => tMessage("payroll.messages.effectiveRangeInvalid"),
      (value, context) => {
        const from = (context.parent as { effectiveFrom?: string })
          .effectiveFrom;
        if (!value || !from) return true;
        return new Date(value).getTime() >= new Date(from).getTime();
      },
    ),
  sortOrder: requiredNumber("payroll.fields.sortOrder").min(1, () =>
    tMessage("payroll.messages.sortOrderMin"),
  ),
});
