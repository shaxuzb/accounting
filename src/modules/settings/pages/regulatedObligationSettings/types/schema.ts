import * as Yup from "yup";
import {
  optionalNumber,
  optionalString,
  requiredNumber,
  requiredString,
} from "../../../shared/validation";

export const regulatedObligationSettingSchema = (isEdit = false) =>
  Yup.object({
    regulatedObligationId: isEdit
      ? optionalNumber()
      : requiredNumber("settings.fields.regulatedObligation"),
    periodicityId: isEdit
      ? optionalNumber()
      : requiredNumber("settings.fields.periodicity"),
    classifierCode: optionalString().max(30),
    rate: optionalNumber().min(0).max(100),
    chartAccountId: isEdit
      ? optionalNumber()
      : requiredNumber("settings.fields.chartAccount"),
    effectiveFrom: isEdit
      ? optionalString()
      : requiredString("settings.fields.effectiveFrom"),
    effectiveTo: optionalString().test(
      "not-before-start",
      "settings.validation.effectiveToBeforeFrom",
      function (value) {
        if (!value || !this.parent.effectiveFrom) return true;
        return value >= this.parent.effectiveFrom;
      },
    ),
    stateId: isEdit
      ? optionalNumber()
      : requiredNumber("settings.fields.status"),
  });
