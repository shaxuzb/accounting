export interface RentalContractObjectForm {
  rentalObjectTypeId: number | null;
  objectName: string;
  objectIdentifier: string;
  objectAddress: string;
  startDate: string;
  endDate: string;
  periodUnit: "DAY" | "MONTH";
  periodValue: number | null;
  contractAmount: number | null;
  taxBaseAmount: number | null;
  taxRate: number | null;
  expenseAccountId: number | null;
}

export interface RentalContractForm {
  lessorFullName: string;
  lessorInn: string | null;
  lessorPinfl: string | null;
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
