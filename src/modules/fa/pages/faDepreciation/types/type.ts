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

/** An asset depreciated by units of production and its output for the month (1C «Выработка ОС»). */
export interface FaAssetOutputRow {
  faAssetId: number;
  inventoryNumber: string;
  assetName: string;
  plannedUnitsTotal: number;
  unitsBefore: number;
  units: number | null;
}

export interface FaAssetOutput {
  periodMonth: string;
  /** A run for the month or a later one is posted. */
  locked: boolean;
  rows: FaAssetOutputRow[];
}

export interface FaAssetOutputSaveRow {
  faAssetId: number;
  units: number | null;
}
