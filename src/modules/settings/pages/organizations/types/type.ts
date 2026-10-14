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
  legalFormId?: number | null;
  pinfl?: string | null;
  vatRegistrationCode?: string | null;
  actualAddress?: string | null;
  email?: string | null;
  website?: string | null;
  oked?: string | null;
  isParent: true;
  stateId: number;
  stateName: string;
  defaultLanguageId: number;
  defaultLanguageName: string;
  createdDate: string;
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

export type {
  DictionaryItem as OrganizationDictionaryItem,
  TaxpayerLookupDto as OrganizationTaxpayerLookup,
} from "@/modules/settings/shared/taxpayerLookup";
