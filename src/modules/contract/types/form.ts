export interface ContractForm {
  organizationId: number | null;
  counterpartyId: number | null;
  contractTypeId: number | null;
  contractDate: string;
  startDate: string;
  endDate: string | null;
  comment: string;
  stateId?: number | null;
}
