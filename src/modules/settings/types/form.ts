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
}
