export interface CounterpartyContact {
  id: number;
  organizationId: number | null;
  counterpartyId: number | null;
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  comment: string;
  stateId: number;
  stateName: string;
}
