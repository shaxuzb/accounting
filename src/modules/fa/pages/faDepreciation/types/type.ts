export interface FaDepreciationRun {
  id: number;
  stateId: number;
  stateName: string;
  documentNumber: number;
  documentDate: string;
  comment: string;
  createdDate: string;
}
export type FaDepreciationRecord = FaDepreciationRun;
