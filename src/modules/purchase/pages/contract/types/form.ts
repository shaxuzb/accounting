export interface ContractForm {
  organizationId: number;
  counterpartyId: number;
  contractType: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  comment: string;
  stateId?: number | null;
}
