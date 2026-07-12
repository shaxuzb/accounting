export interface ChartAccounts {
  id: number;
  organizationId: number;
  organizationName: string;
  parentId: number | null;
  parentName: string | null;
  number?: string;
  code: string;
  name: string;
  isGroup: boolean;
  accountTypeId?: number;
  accountTypeName?: string;
  isQuantity?: boolean;
  isCurrency?: boolean;
  isDepartment?: boolean;
  isTaxAccounting?: boolean;
  isOffBalance?: boolean;
  subkontos?: Array<{
    subkontoTypeId: number;
    sortOrder: number;
    isRequired: boolean;
  }>;
  stateId?: number;
  stateName: string;
  createdDate: string;
}
