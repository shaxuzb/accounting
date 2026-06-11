export interface CounterpartyForm {
  organizationId: number;
  counterpartyTypeId: number;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  stateId?: number;
  email?: string | null;
}
