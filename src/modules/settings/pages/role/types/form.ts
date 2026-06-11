export interface RoleForm {
  fullName: string;
  shortName: string;
  roleModules: number[];
  id?: number | null;
  stateId?: number | null;
}
