import type { RentalContractForm } from "../types/form";

export const emptyLessor = () => ({
  lessorKindCode: "INDIVIDUAL" as const,
  fullName: "",
  inn: null,
  pinfl: null,
  phoneNumber: null,
  registeredAddress: null,
  residentialAddress: null,
});

export const emptyObject = (startDate = "", endDate = "") => ({
  id: null,
  rentalObjectTypeId: null,
  objectName: "",
  objectIdentifier: "",
  objectAddress: "",
  totalArea: null,
  rentedArea: null,
  startDate,
  endDate,
  periodUnit: "MONTH" as const,
  periodAmount: null,
  taxBaseAmount: null,
  taxRate: null,
  expenseAccountId: null,
  utilities: [],
});

export const createRentalContractDefaults = (
  startDate = "",
  endDate = "",
): RentalContractForm => ({
  isFreeOfCharge: false,
  lessors: [emptyLessor()],
  contractNumber: "",
  contractDate: startDate,
  startDate,
  endDate,
  currencyId: null,
  lessorPayableAccountId: null,
  taxPayableAccountId: null,
  comment: "",
  objects: [emptyObject(startDate, endDate)],
});
