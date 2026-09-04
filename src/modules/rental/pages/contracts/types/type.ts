export type RentalLessorKindCode = "INDIVIDUAL" | "LEGAL_ENTITY";
export type RentalUtilityPayerCode = "LESSOR" | "LESSEE";

export interface RentalLessor {
  id?: number;
  lessorKindCode: RentalLessorKindCode | string;
  counterpartyId?: number | null;
  fullName: string;
  inn?: string | null;
  pinfl?: string | null;
  phoneNumber?: string | null;
  registeredAddress?: string | null;
  residentialAddress?: string | null;
}

export interface RentalUtility {
  utilityServiceId: number;
  payerCode: RentalUtilityPayerCode | string;
  utilityServiceCode?: string;
  utilityServiceName?: string;
}

export interface RentalContractObject {
  id: number | null;
  rentalObjectTypeId: number;
  rentalObjectTypeCode?: string;
  rentalObjectTypeName?: string;
  objectName: string;
  objectIdentifier?: string | null;
  objectAddress?: string | null;
  totalArea?: number | null;
  rentedArea?: number | null;
  startDate: string;
  endDate: string;
  periodUnit: "DAY" | "MONTH" | string;
  periodValue: number;
  nextAccrualDate?: string | null;
  contractAmount: number;
  taxBaseAmount: number;
  taxRate: number;
  expenseAccountId?: number | null;
  expenseAccountNumber?: string | number | null;
  expenseAccountName?: string | null;
  utilities: RentalUtility[];
}

export interface RentalContractListItem {
  id: number;
  contractNumber: string;
  contractDate: string;
  isFreeOfCharge: boolean;
  lessors: RentalLessor[];
  startDate: string;
  endDate: string;
  currencyId: number;
  currencyCode?: string;
  statusId: number;
  statusName?: string;
  objectCount: number;
}

export interface RentalContractDetail extends RentalContractListItem {
  organizationId?: number;
  lessorPayableAccountId?: number | null;
  lessorPayableAccountNumber?: string | number | null;
  lessorPayableAccountName?: string | null;
  taxPayableAccountId?: number | null;
  taxPayableAccountNumber?: string | number | null;
  taxPayableAccountName?: string | null;
  comment?: string | null;
  createdDate?: string;
  postedAt?: string | null;
  cancelledAt?: string | null;
  objects: RentalContractObject[];
}

export interface RentalObjectType {
  id: number;
  name: string;
  code: string;
}
