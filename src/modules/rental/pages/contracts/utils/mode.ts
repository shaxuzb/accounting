import type { RentalContractForm } from "../types/form.ts";

type RentalModeValues = Pick<
  RentalContractForm,
  | "isFreeOfCharge"
  | "lessorPayableAccountId"
  | "taxPayableAccountId"
  | "objects"
>;

export type RentalPaidValues = {
  lessorPayableAccountId: number | null;
  taxPayableAccountId: number | null;
  objects: Array<{
    periodAmount: number | null;
    taxBaseAmount: number | null;
    taxRate: number | null;
    expenseAccountId: number | null;
  }>;
};

export const getRentalPaidValues = <T extends RentalModeValues>(
  values: T,
): RentalPaidValues => ({
  lessorPayableAccountId: values.lessorPayableAccountId,
  taxPayableAccountId: values.taxPayableAccountId,
  objects: values.objects.map((object) => ({
    periodAmount: object.periodAmount,
    taxBaseAmount: object.taxBaseAmount,
    taxRate: object.taxRate,
    expenseAccountId: object.expenseAccountId,
  })),
});

export const restoreRentalPaidValues = <T extends RentalModeValues>(
  values: T,
  paidValues: RentalPaidValues,
): T => ({
  ...values,
  lessorPayableAccountId: paidValues.lessorPayableAccountId,
  taxPayableAccountId: paidValues.taxPayableAccountId,
  objects: values.objects.map((object, index) => ({
    ...object,
    ...(paidValues.objects[index] ?? {}),
  })),
});

export const normalizeRentalContractForMode = <T extends RentalModeValues>(
  values: T,
): T => {
  if (!values.isFreeOfCharge) return values;

  return {
    ...values,
    lessorPayableAccountId: null,
    taxPayableAccountId: null,
    objects: values.objects.map((object) => ({
      ...object,
      periodAmount: 0,
      taxBaseAmount: 0,
      taxRate: 0,
      expenseAccountId: null,
    })),
  };
};
