export interface RoleForm {
  fullName: string;
  shortName: string;
  modules: number[];
  id?: number | null;
  stateId?: number | null;
}
