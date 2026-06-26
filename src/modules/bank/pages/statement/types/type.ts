export interface BankStatementTransaction {
  date: string;
  docNumber: string;
  operationTypeId: number;
  operationCode: string;
  mfoCounterparty: string;
  counterpartyAccount: string;
  counterpartyInn: string;
  counterpartyName: string;
  counterpartyId: number;
  debit: number;
  credit: number;
  purpose: string;
  direction: string;
  amount: number;
  currencyId?: number;
  currencyName?: string;
}

export interface BankStatementCardData {
  id: string;
  fileName?: string;
  title: string;
  bankAccountId?: number | null;
  accountNumber?: string;
  currencyId?: number | null;
  operationTypeId?: number | null;
  dateFrom?: string;
  dateTo?: string;
  transactions: BankStatementTransaction[];
  raw: unknown;
}

export interface BankOperationData {
  id: number;
  bankAccountId: number;
  bankAccountName?: string;
  operationTypeId: number;
  operationTypeName?: string;
  counterpartyId: number | null;
  counterpartyName?: string | null;
  docDate: string;
  currencyId: number;
  currencyName?: string;
  amount: number;
  comment?: string | null;
  stateId?: number;
  stateName?: string;
}
