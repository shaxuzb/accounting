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
  /** Kontragentning shu turdagi asosiy shartnomasi (1C «Использовать как основной»). */
  isDefault: boolean;
  /** To'lov muddati, kun (1C «Срок оплаты»); bo'sh — muddat yo'q. */
  paymentTermDays: number | null;
  /** 1C «Тип цен»: the type a customer's sales are priced by. */
  priceTypeId?: number | null;
  isTaxAgentVat: boolean;
  stateId?: number | null;
}

export interface ContractResponsiblePersonForm {
  fullName: string;
  /** Faqat tahrirlashda yuboriladi — yaratishda backend Aktiv qilib qo'yadi. */
  stateId?: number | null;
}
