export interface RoleForm {
  fullName: string;
  shortName: string;
  moduleIds: number[];
  id?: number | null;
  stateId?: number | null;
}
