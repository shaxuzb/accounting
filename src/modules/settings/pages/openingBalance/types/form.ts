export interface OpeningBalanceHeaderForm {
  balanceDate: string;
  description: string;
  stateId: number | null;
}

export interface OpeningBalanceSubkontoForm {
  subkontoTypeId: number;
  subkontoId: number | null;
}

export interface OpeningBalanceDetailForm {
  clientKey: string;
  id: number | null;
  debitAmount: number;
  creditAmount: number;
  quantity: number | null;
  currencyId: number | null;
  currencyAmount: number;
  exchangeRate: number;
  description: string;
  subkontos: OpeningBalanceSubkontoForm[];
}

export interface OpeningBalanceAccountForm {
  id: number | null;
  chartAccountId: number | null;
  details: OpeningBalanceDetailForm[];
}

export interface OpeningBalanceAccountPayload {
  id: number | null;
  chartAccountId: number;
  details: Array<{
    id: number | null;
    debitAmount: number;
    creditAmount: number;
    quantity: number;
    currencyId: number;
    currencyAmount: number;
    exchangeRate: number;
    description: string;
    subkontos: Array<{
      subkontoTypeId: number;
      subkontoId: number;
    }>;
  }>;
}
