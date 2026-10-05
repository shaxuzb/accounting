export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CurrencyRate {
  id: number;
  targetCurrencyId: number;
  targetCurrencyCode: string;
  targetCurrencyName: string;
  effectiveDate: string;
  officialRate: number;
  rateSource?: string | null;
  isActive: boolean;
}

export interface RateOnDate {
  currencyId: number;
  date: string;
  rate: number | null;
  rateDate: string | null;
}

export interface RevaluationSubkonto {
  subkontoTypeId: number;
  entityId: number;
  displayValue?: string | null;
}

export interface RevaluationLine {
  targetCurrencyId: number;
  targetCurrencyCode: string;
  accountId?: number | null;
  accountNumber?: string | null;
  accountName?: string | null;
  balanceAmount: number;
  carryingAmount: number;
  openingRate: number;
  currentRate: number;
  differenceAmount: number;
  subkontos: RevaluationSubkonto[];
}

export interface Revaluation {
  id: number;
  revaluationDate: string;
  providerRateDate?: string | null;
  statusId: number;
  createdDate: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  lines: RevaluationLine[];
  totalGain?: number;
  totalLoss?: number;
  lineCount?: number;
}

export interface RevaluationRequest {
  revaluationDate: string;
  providerRateDate?: string | null;
}
