export interface DocumentAccountSettingAccount {
  chartAccountId: number;
  isDefault: boolean;
  canChange: boolean;
  sortOrder: number;
  chartAccountNumber?: string | number;
  chartAccountName?: string;
}

export interface DocumentAccountChartAccount {
  id: number;
  number?: string | number;
  name?: string;
  code?: string | null;
}

export interface DocumentAccountSettingRole {
  documentAccountRoleId: number;
  documentAccountTypeRoleId: number;
  documentAccountRoleName: string;
  documentAccountRoleCode: string;
  documentAccountRoleDescription?: string;
  accountSide: "debit" | "credit" | string;
  isRequired: boolean;
  sortOrder: number;
  accounts: DocumentAccountSettingAccount[];
}

export interface DocumentAccountSettingsListItem {
  documentTypeId: number;
  documentTypeName: string;
  documentTypeCode: string;
  documentTypeDescription?: string;
  stateId?: number;
  stateName?: string;
}

export interface DocumentAccountSettingsDetail
  extends DocumentAccountSettingsListItem {
  accountSettings: DocumentAccountSettingRole[];
}

export interface DocumentAccountSettingsListResponse {
  items: DocumentAccountSettingsListItem[];
}

export interface DocumentAccountSettingsPayload {
  documentAccountTypeRoleId: number;
  accounts: Array<{
    chartAccountId: number;
    isDefault: boolean;
    canChange: boolean;
    sortOrder: number;
  }>;
}

export interface DocumentAccountSettingsBatchPayload {
  items: DocumentAccountSettingsPayload[];
}
