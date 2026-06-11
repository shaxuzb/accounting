export interface WarehouseForm {
  organizationId: number | null;
  branchId: number | null;
  code: string;
  name: string;
  responsibleUserId: number | null;
  stateId?: number | null;
}
