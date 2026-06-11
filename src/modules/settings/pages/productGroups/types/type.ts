export interface ProductGroups {
  id: number;
  organizationId: number;
  organizationName: string;
  parentId: number | null;
  parentName: string | null;
  code: string;
  name: string;
  stateId: number;
  stateName: string;
  createdDate: string;
}
