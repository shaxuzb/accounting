// Settings
export interface Settings {
  id: string | number;
  name: string;
  createdAt?: string;
}

//Role
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

// Users

export interface Users {
  id: string | number;
  name: string;
  createdAt?: string;
}

// organizations

export interface Organizations {
  id: number;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  director: string;
  isParent: true;
  stateId: number;
  stateName: string;
  defaultLanguageId: number;
  defaultLanguageName: string;
  createdDate: string;
}

export interface organizationDetail {
  id: number;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  address: string;
  director: string;
  isParent: true;
  stateId: number;
  stateName: string;
  defaultLanguageId: number;
  defaultLanguageName: string;
  createdDate: string;
}
export interface organizationUpdate {
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  director: string;
  isParent: boolean;
  defaultLanguageId: number;
  stateId?: number;
}

export interface organizationCreate {
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  director: string;
  isParent: boolean;
  defaultLanguageId: number;
  stateId: number;
}

// Counterparty
export interface Counterparty {
  id: number;
  organizationId: number;
  organizationName: string;
  counterpartyTypeId: number;
  counterpartyTypeName: string;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  stateId: number;
  stateName: string;
  createdDate: string;
}

export interface CounterpartyModule {
  id: number;
  code: string;
  fullName: string;
  shortName: string;
}

export interface CounterpartyModuleGroup {
  id: number;
  fullName: string;
  shortName?: string;
  modules: CounterpartyModule[];
}

export interface CounterpartyDetail extends Counterparty {
  counterpartyModules: Array<{
    id?: number;
    moduleId: number;
  }>;
}
