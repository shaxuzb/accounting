export interface CashFiscalTransfer {
  id: number;
  docNumber?: string | null;
  docDate: string;
  fiscalCashRegisterId: number;
  fiscalCashRegisterName?: string | null;
  cashBoxId: number;
  cashBoxName?: string | null;
  directionId: number;
  directionCode?: string | null;
  directionName?: string | null;
  currencyId: number;
  currencyName?: string | null;
  amount: number;
  exchangeRate: number;
  fiscalCashAccountId?: number | null;
  cashBoxAccountId?: number | null;
  statusId: number;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  comment?: string | null;
}
