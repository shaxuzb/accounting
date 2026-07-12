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
  offsetAccountId?: number | null;
}

export interface BankChartAccountOption {
  id: number;
  number?: string | number;
  name?: string;
}

export interface BankStatementCardData {
  id: string;
  fileName?: string;
  title: string;
  bankAccountId?: number | null;
  bankChartAccountId?: number | null;
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
  docNumber?: string | null;
  bankAccountId: number;
  bankChartAccountId?: number | null;
  bankChartAccountNumber: number;
  offsetAccountNumber: number;
  offsetAccountId?: number | null;
  bankAccountName?: string;
  operationTypeId: number;
  operationTypeName?: string;
  paymentTypeId?: number | null;
  paymentTypeName?: string | null;
  counterpartyBankAccountId?: number | null;
  contractId?: number | null;
  exchangeRate?: number | null;
  counterpartyId: number | null;
  counterpartyName?: string | null;
  docDate: string;
  currencyId: number;
  currencyName?: string;
  amount: number;
  comment?: string | null;
  stateId?: number;
  stateName?: string;
  statusId?: number | null;
  statusName?: string | null;
  counterpartyBankAccountName?: string | null;
  contractName?: string | null;
  counterpartyBankAccountNumber?: string | null;
  contractNumber?: string | null;
  lines?: BankOperationLine[] | null;
}

export interface BankOperationLine {
  id: number;
  orderNumber?: number | null;
  counterpartyId?: number | null;
  amount?: number | null;
  comment?: string | null;
}
