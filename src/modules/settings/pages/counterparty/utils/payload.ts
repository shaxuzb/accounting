import type { CounterpartyForm } from "../types/form";

export type CounterpartyCreatePayload = Omit<CounterpartyForm, "stateId">;

export const toCounterpartyCreatePayload = (
  values: CounterpartyForm,
): CounterpartyCreatePayload => {
  const {
    stateId: _stateId,
    counterpartyTypeId: _counterpartyTypeId,
    counterpartyTypeName: _counterpartyTypeName,
    isCustomer: _isCustomer,
    isSupplier: _isSupplier,
    organizationId: _organizationId,
    ...payload
  } = values as CounterpartyForm & Record<string, unknown>;
  return {
    ...payload,
    shortName: values.shortName.trim(),
    fullName: values.fullName.trim(),
    inn: values.inn.trim(),
    phoneNumber: values.phoneNumber.trim(),
    address: values.address.trim(),
    email: values.email?.trim() || null,
    oked: values.oked?.trim() || null,
    externalId: values.externalId?.trim() || null,
  };
};
