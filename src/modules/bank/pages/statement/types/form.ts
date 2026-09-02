export interface BankOperationCreatePayload {
  bankAccountId: number;
  directionId: number;
  paymentTypeId?: number | null;
  bankChartAccountId?: number | null;
  offsetAccountId?: number | null;
  counterpartyId?: number | null;
  counterpartyBankAccountId?: number | null;
  bankDocumentNumber?: string | null;
  classificationCategoryId?: number | null;
  classificationRuleId?: number | null;
  docDate: string;
  currencyId: number;
  amount: number;
  exchangeRate?: number | null;
  comment?: string | null;
  contractId?: number | null;
  relatedDocumentId?: number | null;
  stateId?: number | null;
}

export type BankStatementOperationCreatePayload = Omit<
  BankOperationCreatePayload,
  "paymentTypeId"
>;

export interface BankOperationsCreatePayload {
  operations: BankStatementOperationCreatePayload[];
}

export interface BankCounterpartyCreatePayload {
  isVatPayer: boolean;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  email: string;
  regionId: number;
  districtId: number;
  address: string;
}

export interface BankCounterpartiesCreatePayload {
  counterparties: BankCounterpartyCreatePayload[];
}
