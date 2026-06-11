export interface Organizations {
  id: number;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  director: string;
  isParent: true;
  stateId: number;
  stateName: string;
  defaultLanguageId: number;
  defaultLanguageName: string;
  createdDate: string;
}

export interface organizationDetail {
  id: number;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  address: string;
  director: string;
  isParent: true;
  stateId: number;
  stateName: string;
  defaultLanguageId: number;
  defaultLanguageName: string;
  createdDate: string;
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
