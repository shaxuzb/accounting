export interface ProductGroupsForm {
  organizationId: number;
  parentId: number | null;
  code: string;
  name: string;
  stateId?: number;
}
