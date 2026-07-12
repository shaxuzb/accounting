export interface ChartAccountPresetLine {
  id?: number;
  subkontoTypeId?: number | null;
  sortOrder?: number;
  isRequired?: boolean;
}

export interface ChartAccountPresetAccount {
  id: number;
  presetId: number;
  code: string | null;
  number: string;
  name: string;
  parentPresetAccountId: number | null;
  parentNumber: string | null;
  accountTypeId: number;
  accountTypeCode: string;
  accountTypeName: string;
  isGroup: boolean;
  isQuantity: boolean;
  isCurrency: boolean;
  isDepartment: boolean;
  isTaxAccounting: boolean;
  isOffBalance: boolean;
  displayOrder: number;
  stateId: number;
  stateName: string;
  hasChartAccount: boolean;
  lines: ChartAccountPresetLine[];
}

export interface SubkontoTypeOption {
  id: number;
  name: string;
  code?: string | null;
}

export interface CreateChartAccountsFromPresetItem {
  preset_account_id: number;
}

export interface ChartAccountPresetAccountsPage {
  items: ChartAccountPresetAccount[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
