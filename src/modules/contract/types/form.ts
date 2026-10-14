export interface ContractForm {
  organizationId: number | null;
  counterpartyId: number | null;
  contractTypeId: number | null;
  /** Qog'ozdagi raqam (1C «Номер»); bo'sh — tizim raqamlaydi. */
  contractNumber: string;
  /** Hisob-kitob valyutasi (1C «Валюта взаиморасчетов»); null — so'm. */
  currencyId: number | null;
  /** Ixtiyoriy: tanlanmasa backendga null yuboriladi. */
  responsiblePersonId: number | null;
  contractDate: string;
  startDate: string;
  endDate: string | null;
  comment: string;
  /** Yetkazib beruvchi narxlari QQS bilanmi — xaridda «Narx QQS bilan» shundan boshlanadi. */
  priceIncludesVat: boolean;
  stateId?: number | null;
}

export interface ContractResponsiblePersonForm {
  fullName: string;
  /** Faqat tahrirlashda yuboriladi — yaratishda backend Aktiv qilib qo'yadi. */
  stateId?: number | null;
}
