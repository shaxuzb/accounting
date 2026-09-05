import type { RentalContractForm } from "../types/form";
import type { RentalContractDetail } from "../types/type";

const emptyLessorValue = {
  lessorKindCode: "INDIVIDUAL" as const,
  fullName: "",
  inn: null,
  pinfl: null,
  phoneNumber: null,
  registeredAddress: null,
  residentialAddress: null,
};

export const mapRentalContractToForm = (
  data: RentalContractDetail,
): RentalContractForm => ({
  isFreeOfCharge: data.isFreeOfCharge ?? false,
  lessors: (data.lessors?.length ? data.lessors : [emptyLessorValue]).map((lessor) => ({
    lessorKindCode: lessor.lessorKindCode === "LEGAL_ENTITY"
      ? ("LEGAL_ENTITY" as const)
      : ("INDIVIDUAL" as const),
    fullName: lessor.fullName ?? "",
    inn: lessor.inn ?? null,
    pinfl: lessor.pinfl ?? null,
    phoneNumber: lessor.phoneNumber ?? null,
    registeredAddress: lessor.registeredAddress ?? null,
    residentialAddress: lessor.residentialAddress ?? null,
  })),
  contractNumber: data.contractNumber ?? "",
  contractDate: data.contractDate ?? "",
  startDate: data.startDate ?? "",
  endDate: data.endDate ?? null,
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
    totalArea: object.totalArea ?? null,
    rentedArea: object.rentedArea ?? null,
    startDate: object.startDate ?? "",
    endDate: object.endDate ?? null,
    periodUnit: object.periodUnit === "DAY" ? "DAY" : "MONTH",
    periodAmount: object.periodAmount,
    taxBaseAmount: object.taxBaseAmount,
    taxRate: object.taxRate,
    expenseAccountId: object.expenseAccountId ?? null,
    utilities: (object.utilities ?? []).map((utility) => ({
      utilityServiceId: utility.utilityServiceId,
      payerCode: utility.payerCode === "LESSEE" ? "LESSEE" : "LESSOR",
    })),
  })),
});
