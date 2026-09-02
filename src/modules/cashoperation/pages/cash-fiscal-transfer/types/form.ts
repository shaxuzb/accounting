export interface CashFiscalTransferForm {
  fiscalCashRegisterId: number | null;
  cashBoxId: number | null;
  directionId: -1 | 1;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number;
  fiscalCashAccountId: number | null;
  cashBoxAccountId: number | null;
  comment: string;
}

export interface CashFiscalTransferRequest extends CashFiscalTransferForm {
  docNumber?: never;
  statusId?: never;
  stateId?: never;
}
