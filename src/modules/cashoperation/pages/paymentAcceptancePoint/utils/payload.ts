import type {
  PaymentAcceptancePointCreatePayload,
  PaymentAcceptancePointForm,
  PaymentAcceptancePointUpdatePayload,
} from "../types/form";

export const toCreatePayload = (
  values: PaymentAcceptancePointForm,
): PaymentAcceptancePointCreatePayload => {
  const { stateId: _stateId, ...payload } = values;
  return {
    ...payload,
    name: values.name.trim(),
    merchantId: values.merchantId.trim(),
    externalId: values.externalId.trim(),
    serialNumber: values.serialNumber.trim(),
  };
};

export const toUpdatePayload = (
  values: PaymentAcceptancePointForm,
): PaymentAcceptancePointUpdatePayload => {
  if (!values.stateId || values.stateId <= 0) {
    throw new Error("Payment acceptance point state is required for update");
  }
  return {
    typeId: values.typeId,
    bankAccountId: values.bankAccountId,
    name: values.name.trim(),
    merchantId: values.merchantId.trim(),
    externalId: values.externalId.trim(),
    serialNumber: values.serialNumber.trim(),
    stateId: values.stateId,
  };
};
