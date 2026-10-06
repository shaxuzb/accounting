export interface FaDepreciationRunLine {
  id: number;
  faAssetId: number;
  inventoryNumber: string;
  assetName: string;
  depreciationMethodName?: string;
  amount: number;
  note?: string | null;
}

export interface FaDepreciationRun {
  id: number;
  docNumber: string;
  /** The month depreciated (its first day). */
  periodMonth: string;
  statusId: number;
  statusName?: string;
  note?: string | null;
  totalAmount: number;
  createdDate: string;
  postedAt?: string | null;
  cancelledAt?: string | null;
  lines?: FaDepreciationRunLine[];
}
export type FaDepreciationRecord = FaDepreciationRun;
