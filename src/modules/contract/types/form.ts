export interface ContractForm {
  organizationId: number | null;
  counterpartyId: number | null;
  contractTypeId: number | null;
  /** Ixtiyoriy: tanlanmasa backendga null yuboriladi. */
  responsiblePersonId: number | null;
  contractDate: string;
  startDate: string;
  endDate: string | null;
  comment: string;
  stateId?: number | null;
}

export interface ContractResponsiblePersonForm {
  fullName: string;
  /** Faqat tahrirlashda yuboriladi — yaratishda backend Aktiv qilib qo'yadi. */
  stateId?: number | null;
}
