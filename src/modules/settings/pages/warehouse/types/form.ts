export interface WarehouseForm {
  organizationId: number | null;
  branchId: number | null;
  code: string;
  name: string;
  responsibleUserId: number | null;
  stateId?: number | null;
  /** kept as loaded: the form does not edit them, the save sends them back */
  isMain?: boolean;
  address?: string | null;
  /** a retail store kept at sale prices (1C АТТ): goods on 2920.2, the markup on 2980.2 */
  isRetail?: boolean;
  retailStockAccountId?: number | null;
  markupAccountId?: number | null;
}
