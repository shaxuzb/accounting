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
  prorationBasis: requiredString("payroll.fields.prorationBasis"),
  defaultAmount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  defaultRate: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  dependsOnComponentId: Yup.number().nullable(),
  minimumAmount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  maximumAmount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative"))
    .test(
      "amount-range",
      () => tMessage("payroll.messages.componentAmountRange", { defaultValue: "Minimum cannot exceed maximum" }),
      (value, context) => {
        const minimum = (context.parent as { minimumAmount?: number | null }).minimumAmount;
        return value == null || minimum == null || minimum <= value;
      },
    ),
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
