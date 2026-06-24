export interface BankStatementTransaction {
  id: string;
  fields: Record<string, unknown>;
  date?: string;
  docDate?: string;
  docNumber?: string;
  operationCode?: string;
  operationTypeId?: number | null;
  account?: string;
  mfoCounterparty?: string;
  counterpartyAccount?: string;
  counterpartyInn?: string;
  counterpartyName?: string;
  counterparty?: string;
  counterpartyId: number | null;
  bankAccountId?: number | null;
  currencyId?: number | null;
  debit?: number | null;
  credit?: number | null;
  purpose?: string;
  comment?: string;
  direction?: string;
  amount?: number | null;
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
  metadata: Record<string, unknown>;
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

export interface BankOperationCreatePayload {
  bankAccountId: number;
  operationTypeId: number;
  counterpartyId: number;
  docDate: string;
  currencyId: number;
  amount: number;
  comment: string | null;
}

export interface BankOperationsCreatePayload {
  operations: BankOperationCreatePayload[];
}
