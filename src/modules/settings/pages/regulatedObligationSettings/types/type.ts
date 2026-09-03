export interface RegulatedObligationSetting {
  id?: number | null;
  regulatedObligationId: number;
  code: string;
  name: string;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  settingId: number | null;
  organizationId: number;
  periodicityId: number | null;
  periodicityCode: string | null;
  periodicityName: string | null;
  classifierCode: string | null;
  rate: number | null;
  chartAccountId: number | null;
  chartAccountNumber: string | null;
  chartAccountName: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  stateId: number | null;
  stateName: string | null;
  createdDate: string | null;
  updatedDate: string | null;
}

export type RegulatedObligationSettingPayload =
  RegulatedObligationSettingFormPayload;

export interface RegulatedObligationSettingFormPayload {
  regulatedObligationId: number;
  periodicityId: number;
  classifierCode: string | null;
  rate: number | null;
  chartAccountId: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  stateId: number;
}
