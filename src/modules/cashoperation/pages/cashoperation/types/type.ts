export interface CashOperation {
  id: number;
  docNumber?: string | null;
  cashBoxId: number | null;
  cashBoxName?: string | null;
  cashOperationId: number | null;
  cashOperationName?: string | null;
  counterpartyId: number | null;
  counterpartyName?: string | null;
  docDate: string;
  currencyId: number | null;
  currencyName?: string | null;
  amount: number;
  comment?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  statusName?: string | null;
  statusId?: number | null;
  operationTypeId: number | null;
  operationTypeName?: string | null;
}
