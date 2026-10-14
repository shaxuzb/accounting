export interface organizationCreate {
  legalFormId?: number | null;
  pinfl?: string | null;
  vatRegistrationCode?: string | null;
  actualAddress?: string | null;
  email?: string | null;
  website?: string | null;
  oked?: string | null;
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
  legalFormId?: number | null;
  pinfl?: string | null;
  vatRegistrationCode?: string | null;
  actualAddress?: string | null;
  email?: string | null;
  website?: string | null;
  oked?: string | null;
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
