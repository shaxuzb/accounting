export interface BankOperationCreatePayload {
  bankAccountId: number;
  bankChartAccountId: number;
  offsetAccountId: number;
  operationTypeId: number;
  paymentTypeId: number;
  counterpartyId: number;
  counterpartyBankAccountId: number;
  contractId: number;
  exchangeRate: number;
  docDate: string;
  currencyId: number;
  amount: number;
  comment: string | null;
  stateId?: number;
}

export type BankStatementOperationCreatePayload = Omit<
  BankOperationCreatePayload,
  "paymentTypeId"
>;

export interface BankOperationsCreatePayload {
  operations: BankStatementOperationCreatePayload[];
}

export interface BankCounterpartyCreatePayload {
  counterpartyTypeId: number;
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
