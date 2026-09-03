import type { RentalContractForm } from "../types/form";
import type { RentalContractDetail } from "../types/type";

export const mapRentalContractToForm = (
  data: RentalContractDetail,
): RentalContractForm => ({
  lessorFullName: data.lessorFullName ?? "",
  lessorInn: data.lessorInn ?? null,
  lessorPinfl: data.lessorPinfl ?? null,
  contractNumber: data.contractNumber ?? "",
  contractDate: data.contractDate ?? "",
  startDate: data.startDate ?? "",
  endDate: data.endDate ?? "",
  currencyId: data.currencyId ?? null,
  lessorPayableAccountId: data.lessorPayableAccountId ?? null,
  taxPayableAccountId: data.taxPayableAccountId ?? null,
  comment: data.comment ?? "",
  objects: data.objects.map((object) => ({
    id: object.id,
    rentalObjectTypeId: object.rentalObjectTypeId,
    objectName: object.objectName ?? "",
    objectIdentifier: object.objectIdentifier ?? "",
    objectAddress: object.objectAddress ?? "",
    startDate: object.startDate ?? "",
    endDate: object.endDate ?? "",
    periodUnit: object.periodUnit === "DAY" ? "DAY" : "MONTH",
    periodValue: object.periodValue,
    contractAmount: object.contractAmount,
    taxBaseAmount: object.taxBaseAmount,
    taxRate: object.taxRate,
    expenseAccountId: object.expenseAccountId ?? null,
  })),
});
