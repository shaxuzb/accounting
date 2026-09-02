export interface PaymentAcceptancePointForm {
  typeId: number | null;
  bankAccountId: number | null;
  name: string;
  merchantId: string;
  externalId: string;
  serialNumber: string;
  stateId?: number | null;
}

export type PaymentAcceptancePointCreatePayload = Omit<
  PaymentAcceptancePointForm,
  "stateId"
>;

export type PaymentAcceptancePointUpdatePayload = Omit<
  PaymentAcceptancePointForm,
  "stateId"
> & {
  stateId: number;
};
