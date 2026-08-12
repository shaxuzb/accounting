export interface FaDepreciationRun {
  id: number;
  stateId?: number;
  stateName?: string;
  statusId: number;
  statusName?: string;
  documentNumber?: number | string;
  documentDate?: string;
  period?: string;
  periodFrom?: string;
  periodTo?: string;
  comment?: string;
  createdDate: string;
}
export type FaDepreciationRecord = FaDepreciationRun;
