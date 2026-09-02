export interface CounterpartyForm {
  code?: string;
  isVatPayer: boolean;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  stateId?: number;
  email?: string | null;
  oked?: string | null;
  externalId?: string | null;
}
