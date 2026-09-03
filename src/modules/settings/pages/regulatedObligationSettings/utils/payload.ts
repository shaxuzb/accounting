import type {
  RegulatedObligationSettingForm,
  RegulatedObligationSettingFormPayload,
} from "../types";

export function buildRegulatedObligationSettingPayload(
  values: RegulatedObligationSettingForm,
): RegulatedObligationSettingFormPayload {
  return {
    regulatedObligationId: Number(values.regulatedObligationId),
    periodicityId: Number(values.periodicityId),
    classifierCode: values.classifierCode.trim() || null,
    rate:
      values.rate === null || values.rate === undefined
        ? null
        : Number(values.rate),
    chartAccountId: Number(values.chartAccountId),
    effectiveFrom: values.effectiveFrom,
    effectiveTo: values.effectiveTo?.trim() || null,
    stateId: Number(values.stateId),
  };
}
