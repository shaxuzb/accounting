export interface ContractForm {
  organizationId: number | null;
  counterpartyId: number | null;
  contractTypeId: number | null;
  contractDate: string;
  startDate: string;
  endDate: string;
  comment: string;
  stateId?: number | null;
}
