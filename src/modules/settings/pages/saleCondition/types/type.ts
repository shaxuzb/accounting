export interface SaleCondition {
  id: number;
  costingMethodId: number;
  costingMethodName?: string;
  costingMethodCode?: string;
  vatRateId: number;
  vatRateName?: string;
  vatRateCode?: string;
  startDate: string;
  endDate: string | null;
  stateId?: number;
  stateName?: string;
  organizationId?: number;
  organizationName?: string;
  createdDate?: string;
}
