export interface CounterpartyContactForm {
  organizationId: number;
  counterpartyId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  comment: string;
  stateId: number | null;
}
