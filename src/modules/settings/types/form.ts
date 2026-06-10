// Settings
export interface SettingsForm {
  name: string;
}

// Role
export interface RoleForm {
  fullName: string;
  shortName: string;
  roleModules: number[];
  id?: number | null;
  stateId?: number | null;
}

// Users
export interface UsersForm {
  name: string;
}

// Counterparty
export interface CounterpartyForm {
  organizationId: number;
  counterpartyTypeId: number;
  shortName: string;
  fullName: string;
  inn: string;
  phoneNumber: string;
  regionId: number;
  districtId: number;
  address: string;
  stateId?: number;
  email?: string | null;
}

export interface CounterpartyDetail extends CounterpartyForm {
  id: number;
  organizationName: string;
  counterpartyTypeName: string;
  regionName: string;
  districtName: string;
  createdDate: string;
}

// Deparments
export interface DepartmentsForm {
  organizationId: number;
  branchId: number;
  code: string;
  name: string;
  stateId?: number
}
