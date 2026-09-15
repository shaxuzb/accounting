export interface Contract {
  id: number;
  organizationId: number;
  organizationName: string;
  counterpartyId: number;
  counterpartyName: string;
  contractType?: string;
  contractTypeName: string;
  contractTypeId: number;
  responsiblePersonId?: number | null;
  responsiblePersonName?: string | null;
  contractNumber: string;
  contractDate: string;
  startDate: string;
  endDate: string;
  stateId: number;
  stateName: string;
  createdDate: string;
  comment: string;
}

/** Shartnoma uchun mas'ul shaxs — xodimlar ma'lumotnomasidan mustaqil ro'yxat. */
export interface ContractResponsiblePerson {
  id: number;
  organizationId: number;
  fullName: string;
  stateId: number;
  stateName: string;
  createdDate: string;
}
