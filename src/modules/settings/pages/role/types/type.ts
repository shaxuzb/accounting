export interface Role {
  createdDate: string;
  fullName: string;
  id: number;
  shortName: string;
  stateId: number;
  stateName: string;
}

export interface RoleModule {
  id: number;
  code: string;
  fullName: string;
  shortName: string;
}

export interface RoleModuleGroup {
  id: number;
  fullName: string;
  shortName?: string;
  modules: RoleModule[];
}

export interface RoleDetail extends Role {
  roleModules: Array<{
    id?: number;
    moduleId: number;
  }>;
}
