export interface TaxpayerLookupDto {
  CompanyInn: string | null;
  Pinfl: string | null;
  CompanyName: string | null;
  CompanyAddress: string | null;
  RegionCode: string | null;
  Region: string | null;
  DistrictCode: string | null;
  District: string | null;
  PhoneNumber: string | null;
  Email: string | null;
  VatCode: string | null;
  SpecialAccount: string | null;
  Accounts: Array<{
    BankName: string | null;
    BankMfo: string | null;
    AccountCode: string | null;
    IsPrimary: boolean;
  }>;
  DirectorInn: string | null;
  DirectorPinfl: string | null;
  DirectorName: string | null;
  Accountant: string | null;
  Oked: string | null;
  TaxGap: string | null;
  TaxPayerTypeName: string | null;
  Branches: Array<{
    Id: number | null;
    Name: string | null;
    Code: string | null;
  }>;
}

export interface DictionaryItem {
  id: number;
  code?: string | number | null;
  regionCode?: string | number | null;
  districtCode?: string | number | null;
  Code?: string | number | null;
  RegionCode?: string | number | null;
  DistrictCode?: string | number | null;
  region_code?: string | number | null;
  district_code?: string | number | null;
}
