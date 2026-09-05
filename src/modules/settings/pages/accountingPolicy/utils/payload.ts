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

export const buildAccountingPolicyFormValues = (
  policy: AccountingPolicyCurrentDto,
): AccountingPolicyFormValues => ({
  inventoryValuationMethod: "FIFO",
  baseCurrencyId: 1,
  vatPayer: true,
  taxTypeId: getFieldValue(policy.vat?.taxTypeId, policy.taxTypeId),
  vatTaxPeriod: "MONTH",
  vatBaseMoment: "SHIPMENT",
  effectiveFrom:
    getFieldValue(policy.governance?.effectiveFrom, policy.effectiveFrom) ?? "",
  effectiveTo: getFieldValue(
    policy.governance?.effectiveTo,
    policy.effectiveTo,
  ),
  productionEnabled: getFieldValue(
    policy.production?.productionEnabled,
    policy.productionEnabled,
  ),
  foreignCurrencyEnabled: policy.foreignCurrencyEnabled,
  costAllocationMethod: getFieldValue(
    policy.costing?.costAllocationMethod,
    policy.costAllocationMethod,
  ),
  closedPeriodPolicy: "PROTECT_CLOSED_PERIOD",
});

export const buildAccountingPolicyUpdateFromForm = (
  _policy: AccountingPolicyCurrentDto,
  values: AccountingPolicyFormValues,
): AccountingPolicyUpdateRequest => ({
  ...values,
});
