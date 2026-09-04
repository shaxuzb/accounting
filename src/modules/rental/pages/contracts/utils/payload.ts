import type { RentalLessorForm } from "../types/form.ts";

type UnknownRecord = Record<string, unknown>;

const normalizeRentalDate = (value: unknown): string =>
  String(value ?? "").trim().match(/^\d{4}-\d{2}-\d{2}/)?.[0] ??
  String(value ?? "").trim();

const buildLessorPayload = (lessor: RentalLessorForm) => ({
  lessorKindCode: lessor.lessorKindCode,
  fullName: lessor.fullName.trim(),
  inn: lessor.inn?.trim() || null,
  pinfl: lessor.pinfl?.trim() || null,
  phoneNumber: lessor.phoneNumber?.trim() || null,
  registeredAddress: lessor.registeredAddress?.trim() || null,
  residentialAddress: lessor.residentialAddress?.trim() || null,
});

interface BuildContractPayloadOptions {
  includeObjectIds?: boolean;
}

export const buildContractPayload = (
  values: UnknownRecord,
  { includeObjectIds = true }: BuildContractPayloadOptions = {},
): UnknownRecord => {
  const {
    id: _id,
    organizationId: _organizationId,
    statusId: _statusId,
    statusName: _statusName,
    createdDate: _createdDate,
    postedAt: _postedAt,
    cancelledAt: _cancelledAt,
    lessorFullName: _lessorFullName,
    lessorInn: _lessorInn,
    lessorPinfl: _lessorPinfl,
    isFreeOfCharge,
    lessors,
    objects,
    ...payload
  } = values;

  return {
    ...payload,
    isFreeOfCharge: Boolean(isFreeOfCharge),
    contractDate: normalizeRentalDate(payload.contractDate),
    startDate: normalizeRentalDate(payload.startDate),
    endDate: normalizeRentalDate(payload.endDate),
    lessors: Array.isArray(lessors)
      ? lessors.map((lessor) =>
          buildLessorPayload(lessor as RentalLessorForm),
        )
      : [],
    objects: Array.isArray(objects)
      ? objects.map((item) => {
          const {
            id,
            nextAccrualDate: _nextAccrualDate,
            rentalObjectTypeCode: _rentalObjectTypeCode,
            rentalObjectTypeName: _rentalObjectTypeName,
            expenseAccountNumber: _expenseAccountNumber,
            expenseAccountName: _expenseAccountName,
            ...objectPayload
          } = item as UnknownRecord;
          const normalizedObject = {
            ...objectPayload,
            startDate: normalizeRentalDate(objectPayload.startDate),
            endDate: normalizeRentalDate(objectPayload.endDate),
          };
          return includeObjectIds && typeof id === "number"
            ? { ...normalizedObject, id }
            : normalizedObject;
        })
      : [],
  };
};
