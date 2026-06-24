export interface PurchaseService {
  id: number;
  name: string;
  description: string | null;
  serviceTypeId: number;
  serviceTypeName?: string | null;
  stateId: number;
  stateName: string;
  createdDate?: string;
}

export type PurchaseServiceDetail = PurchaseService;

export interface PurchaseServiceCreate {
  name: string;
  description: string | null;
  serviceTypeId: number;
}

export interface PurchaseServiceUpdate extends PurchaseServiceCreate {
  stateId: number;
}
