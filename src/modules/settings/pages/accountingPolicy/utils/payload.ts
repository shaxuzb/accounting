import type {
  AccountingPolicyFormValues,
  AccountingPolicyUpdateRequest,
  AccountingPolicyCurrentDto,
} from "../types/type";

const getFieldValue = <T>(
  field: { value: T | null } | undefined,
  fallback: T | null,
) => (field ? field.value : fallback);

export const buildAccountingPolicyUpdatePayload = (
  values: AccountingPolicyUpdateRequest,
) => {
  const { ...payload } = values;
  return payload;
};

/**
 * A new policy version: the VAT payer as it stands now, starting today. Only what the server
 * takes is in the form: the valuation (FIFO), base currency (UZS), VAT period and moment are
 * fixed by the approved policy and sent as such; the rest is out of scope and sent empty.
 */
export const buildAccountingPolicyFormValues = (
  policy: AccountingPolicyCurrentDto,
  today: string,
): AccountingPolicyFormValues => ({
  inventoryValuationMethod: "FIFO",
  baseCurrencyId: 1,
  vatPayer: getFieldValue(policy.vat?.isVatPayer, policy.isVatPayer) ?? true,
  taxTypeId: null,
  vatTaxPeriod: "MONTH",
  vatBaseMoment: "SHIPMENT",
  effectiveFrom: today,
  effectiveTo: null,
  productionEnabled: null,
  foreignCurrencyEnabled: null,
  costAllocationMethod: null,
  closedPeriodPolicy: "PROTECT_CLOSED_PERIOD",
});

export const buildAccountingPolicyUpdateFromForm = (
  _policy: AccountingPolicyCurrentDto,
  values: AccountingPolicyFormValues,
): AccountingPolicyUpdateRequest => ({
  ...values,
});
