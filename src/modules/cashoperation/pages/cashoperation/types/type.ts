export interface CashOperation {
  id: number;
  docNumber?: string | null;
  cashBoxId: number | null;
  cashChartAccountId?: number | null;
  offsetAccountId?: number | null;
  cashBoxName?: string | null;
  cashOperationId: number | null;
  cashOperationName?: string | null;
  paymentPurposeName?: string | null;
  paymentTypeId?: number | null;
  paymentTypeName?: string | null;
  counterpartyId: number | null;
  counterpartyName?: string | null;
  contractId?: number | null;
  contractNumber?: string | null;
  docDate: string;
  currencyId: number | null;
  currencyName?: string | null;
  exchangeRate?: number | null;
  amount: number;
  comment?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  statusName?: string | null;
  statusId?: number | null;
  operationTypeId: number | null;
  operationTypeName?: string | null;
}
