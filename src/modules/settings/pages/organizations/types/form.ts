export interface organizationCreate {
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  director: string;
  isParent: boolean;
  defaultLanguageId: number;
  stateId: number;
}

export interface organizationUpdate {
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  director: string;
  isParent: boolean;
  defaultLanguageId: number;
  stateId?: number;
}
