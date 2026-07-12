export interface ChartAccountsForm {
  number: string;
  code: string;
  name: string;
  isGroup: boolean;
  accountTypeId: number;
  isQuantity: boolean;
  isCurrency: boolean;
  isDepartment: boolean;
  isTaxAccounting: boolean;
  isOffBalance: boolean;
  subkontos: Array<{
    subkontoTypeId: number;
    sortOrder: number;
    isRequired: boolean;
  }>;
  subkontoTypeIds?: number[];
  organizationId?: number | null;
  stateId?: number | null;
}
