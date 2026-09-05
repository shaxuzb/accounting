import type { RentalContractForm } from "../types/form.ts";

type RentalModeValues = Pick<
  RentalContractForm,
  | "isFreeOfCharge"
  | "lessorPayableAccountId"
  | "taxPayableAccountId"
  | "objects"
>;

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
