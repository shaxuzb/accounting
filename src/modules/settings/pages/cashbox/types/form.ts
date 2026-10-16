export interface CashBoxForm {
  organizationId: number | null;
  branchId: number | null;
  code: string;
  name: string;
  currencyId: number;
  stateId?: number | null;
  /** Kept as loaded: the form has no field for them, and a save must not clear them. */
  isMain?: boolean;
  responsibleUserId?: number | null;
  /** The cash account the desk keeps its money on (5010.x / 5020), offered in its orders. */
  chartAccountId?: number | null;
}
