import * as Yup from "yup";
import {
  requiredNumber,
  requiredString,
  tMessage,
} from "../../../shared/validation";

export const payrollTaxDefinitionSchema = Yup.object({
  code: requiredString("payroll.fields.taxCode"),
  name: requiredString("payroll.fields.taxName"),
  taxType: requiredString("payroll.fields.taxType"),
  baseType: requiredString("payroll.fields.taxBaseType"),
  rate: requiredNumber("payroll.fields.taxRate")
    .min(0, () => tMessage("payroll.messages.notNegative"))
    .max(100, () => tMessage("payroll.messages.rateMax")),
  exemptionAmount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  limitAmount: Yup.number()
    .nullable()
    .min(0, () => tMessage("payroll.messages.notNegative")),
  liabilityAccountId: requiredNumber("payroll.fields.taxLiabilityAccount").moreThan(
    0,
    () => tMessage("payroll.messages.accountRequired"),
  ),
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
});
