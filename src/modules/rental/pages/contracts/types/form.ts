import type {
  RentalLessorKindCode,
  RentalUtilityPayerCode,
} from "./type";

export interface RentalLessorForm {
  lessorKindCode: RentalLessorKindCode;
  /** Co-owners' share of the rent, %; empty for all — equal shares. */
  sharePercent: number | null;
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
  endDate: string | null;
  periodUnit: "DAY" | "MONTH";
  periodAmount: number | null;
  taxBaseAmount: number | null;
  /** NSBU 6, 46: the contract value of the object, kept off the balance sheet on 001. */
  objectValue: number | null;
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
  endDate: string | null;
  currencyId: number | null;
  lessorPayableAccountId: number | null;
  taxPayableAccountId: number | null;
  comment: string;
  objects: RentalContractObjectForm[];
}
