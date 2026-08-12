export interface CommissioningReadonlyAsset {
  key: string;
  index: number;
  inventoryNumber: string;
  assetName: string;
  deprStartDate: string;
  salvageValue: number;
  usefulLifeMonths: number;
  depreciationMethod: string;
  plannedUnitsTotal: number | null;
  department: string;
  responsibleUser: string;
  accumulatedDepreciationAccount: string;
  depreciationExpenseAccount: string;
  note: string;
}
