export interface CashBoxForm {
  organizationId: number | null;
  branchId: number | null;
  code: string;
  name: string;
  currencyId: number;
  stateId?: number | null;
}
