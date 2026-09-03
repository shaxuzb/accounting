export interface RegulatedObligationSettingForm {
  regulatedObligationId: number | null;
  periodicityId: number | null;
  classifierCode: string;
  rate: number | null;
  chartAccountId: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  stateId: number | null;
}
