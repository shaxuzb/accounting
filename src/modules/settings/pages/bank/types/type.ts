export interface SettingsBank {
  id: number;
  code: string;
  name: string;
  mfo: string | null;
  stateId: number;
  stateName: string;
  createdDate?: string;
}

export type SettingsBankDetail = SettingsBank;

export interface SettingsBankCreate {
  code: string;
  name: string;
  mfo: string | null;
}

export interface SettingsBankUpdate extends SettingsBankCreate {
  stateId: number;
}
