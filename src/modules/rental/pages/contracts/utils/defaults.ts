import type { RentalContractForm } from "../types/form";

export const emptyObject = (startDate = "", endDate = "") => ({
  id: null,
  rentalObjectTypeId: null,
  objectName: "",
  objectIdentifier: "",
  objectAddress: "",
  startDate,
  endDate,
  periodUnit: "MONTH" as const,
  periodValue: null,
  contractAmount: null,
  taxBaseAmount: null,
  taxRate: null,
  expenseAccountId: null,
});

export const createRentalContractDefaults = (
  startDate = "",
  endDate = "",
): RentalContractForm => ({
  lessorFullName: "",
  lessorInn: null,
  lessorPinfl: null,
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
