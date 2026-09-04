import type {
  RentalLessorKindCode,
  RentalUtilityPayerCode,
} from "./type";

export interface RentalLessorForm {
  lessorKindCode: RentalLessorKindCode;
  fullName: string;
  inn: string | null;
  pinfl: string | null;
  phoneNumber: string | null;
  registeredAddress: string | null;
  residentialAddress: string | null;
}

export interface RentalUtilityForm {
  utilityServiceId: number | null;
  payerCode: RentalUtilityPayerCode;
}

export interface RentalContractObjectForm {
  id?: number | null;
  rentalObjectTypeId: number | null;
  objectName: string;
  objectIdentifier: string;
  objectAddress: string;
  totalArea: number | null;
  rentedArea: number | null;
  startDate: string;
  endDate: string;
  periodUnit: "DAY" | "MONTH";
  periodValue: number | null;
  contractAmount: number | null;
  taxBaseAmount: number | null;
  taxRate: number | null;
  expenseAccountId: number | null;
  utilities: RentalUtilityForm[];
}

export interface RentalContractForm {
  isFreeOfCharge: boolean;
  lessors: RentalLessorForm[];
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  currencyId: number | null;
  lessorPayableAccountId: number | null;
  taxPayableAccountId: number | null;
  comment: string;
  objects: RentalContractObjectForm[];
}
