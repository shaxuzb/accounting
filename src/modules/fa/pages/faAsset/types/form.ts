export interface FaAssetForm {
  inventoryNumber: string;
  name: string;
  faGroupId: number | null;
  okofId: number | null;
  depreciationMethodId: number | null;
  usefulLifeMonths: number | null;
  initialCost: number | null;
  salvageValue: number | null;
  commissioningDate: string;
  deprStartDate: string;
  plannedUnitsTotal: number | null;
  sourceProductTableId: number | null;
  departmentId: number | null;
  responsibleUserId: number | null;
  stateId?: number;
  statusId?: number;
}
