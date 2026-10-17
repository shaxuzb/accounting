export interface BankStatementTransaction {
  date: string;
  docNumber: string;
  bankDocumentNumber?: string | null;
  operationTypeId: number;
  operationCode: string;
  mfoCounterparty: string;
  counterpartyAccount: string;
  counterpartyInn: string;
  counterpartyName: string;
  counterpartyId: number | null;
  debit: number;
  credit: number;
  purpose: string;
  direction: string;
  directionId?: number | null;
  amount: number;
  currencyId?: number;
  currencyName?: string;
  offsetAccountId?: number | null;
  /** The operation kind (1C «Вид операции») the account was taken from. */
  operationKindId?: number | null;
  /** true: the account came from the kind; false: the user chose it; unset: not filled yet. */
  offsetAutoFilled?: boolean;
  contractId?: number | null;
  counterpartyBankAccountId?: number | null;
  classificationCategoryId?: number | null;
  classificationCode?: string | null;
  classificationName?: string | null;
  classificationRuleId?: number | null;
  classificationRuleCode?: string | null;
  relatedDocumentId?: number | null;
  isNewOperation?: boolean;
  requiresReview?: boolean;
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
  /** true: the bank's account (5110) was put by default; false: the user chose it. */
  bankChartAutoFilled?: boolean;
  bankAccountId?: number | null;
  bankId?: number | null;
  bankBranchId?: number | null;
  bankMfo?: string;
  bankName?: string;
  bankInn?: string | null;
  companyName?: string;
  companyInn?: string;
  bankChartAccountId?: number | null;
  accountNumber?: string;
  currencyId?: number | null;
  currencyName?: string;
  operationTypeId?: number | null;
  totalDebit?: number | null;
  totalCredit?: number | null;
  openingBalance?: number | null;
  closingBalance?: number | null;
  /** The books' balance before the statement's first day (1C compares it with the opening balance). */
  ledgerOpeningBalance?: number | null;
  ledgerClosingBalance?: number | null;
  hasActivity?: boolean;
  periodFrom?: string;
  periodTo?: string;
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
  operationTypeId?: number | null;
  directionId?: number | null;
  direction?: string | null;
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
  bankDocumentNumber?: string | null;
  classificationCategoryId?: number | null;
  classificationCode?: string | null;
  classificationName?: string | null;
  classificationRuleId?: number | null;
  classificationRuleCode?: string | null;
  stateId?: number;
  stateName?: string;
  statusId?: number | null;
  statusName?: string | null;
  counterpartyBankAccountName?: string | null;
  contractName?: string | null;
  counterpartyBankAccountNumber?: string | null;
  contractNumber?: string | null;
  relatedDocumentId?: number | null;
  relatedDocumentTypeId?: number | null;
  relatedDocumentTypeName?: string | null;
  relatedDocumentEntityId?: number | null;
  relatedDocumentNumber?: string | null;
  relatedDocumentDate?: string | null;
  lines?: BankOperationLine[] | null;
}

export interface BankOperationLine {
  id: number;
  orderNumber?: number | null;
  counterpartyId?: number | null;
  amount?: number | null;
  comment?: string | null;
}
