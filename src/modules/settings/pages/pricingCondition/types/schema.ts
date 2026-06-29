import * as Yup from "yup";
import {
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const pricingConditionSchema = () =>
  Yup.object({
    pricingMethodId: requiredNumber("settings.fields.pricingMethod"),
    pricingValue: requiredNumber("settings.fields.pricingValue"),
    roundingMethodId: requiredNumber("settings.fields.roundingMethod"),
    roundingPrecision: requiredNumber("settings.fields.roundingPrecision"),
    startDate: requiredString("settings.fields.startDate"),
    endDate: Yup.string().nullable(),
  });
