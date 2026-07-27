export interface OpeningBalanceAccountSummary {
  id: number;
  chartAccountId: number;
  debitAmount: number;
  creditAmount: number;
  createdDate: string;
  chartAccountName: string;
  chartAccountNumber: string;
  chartAccountCode: string | null;
}

export interface OpeningBalance {
  id: number;
  organizationId: number;
  balanceDate: string;
  description: string;
  stateId: number;
  createdDate: string;
  organizationName: string;
  stateName: string;
  accounts: OpeningBalanceAccountSummary[];
}

export interface OpeningBalanceSubkonto {
  subkontoTypeId: number;
  subkontoId: number;
  sortOrder: number;
  createdDate?: string;
  subkontoTypeName?: string;
  subkontoTypeCode?: string;
  subkontoName?: string;
}

export interface OpeningBalanceDetail {
  id: number | null;
  debitAmount: number;
  creditAmount: number;
  quantity: number | null;
  currencyId: number | null;
  currencyAmount: number;
  exchangeRate: number;
  description: string;
  sortOrder: number;
  createdDate: string;
  currencyName: string;
  currencyCode: string;
  subkontos: OpeningBalanceSubkonto[];
}

export interface OpeningBalanceAccountDetail extends OpeningBalanceAccountSummary {
  details: OpeningBalanceDetail[];
}

export interface SubkontoTypeOption {
  id: number;
  name: string;
  code?: string;
  sortOrder?: number;
  isRequired?: boolean;
}
