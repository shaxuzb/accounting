export interface ChartAccounts {
  id: number;
  organizationId: number;
  organizationName: string;
  parentId: number | null;
  parentName: string | null;
  code: string;
  name: string;
  isGroup: boolean;
  stateId: number;
  stateName: string;
  createdDate: string;
}
