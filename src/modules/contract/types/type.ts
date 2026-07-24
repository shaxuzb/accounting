export interface Contract {
  id: number;
  organizationId: number;
  organizationName: string;
  counterpartyId: number;
  counterpartyName: string;
  contractType?: string;
  contractTypeName: string;
  contractTypeId: number;
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  stateId: number;
  stateName: string;
  createdDate: string;
  comment: string;
}
