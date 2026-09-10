import type {
  PayrollCalculationMethod,
  PayrollComponentType,
  PayrollProrationBasis,
} from "@/modules/payroll/constants/options";

export interface PayrollComponent {
  id: number;
  organizationId?: number | null;
  organizationName?: string | null;
  code: string;
  name: string;
  componentType: PayrollComponentType;
  componentTypeName?: string | null;
  calculationMethod: PayrollCalculationMethod;
  prorationBasis: PayrollProrationBasis;
  calculationMethodName?: string | null;
  defaultAmount?: number | null;
  defaultRate?: number | null;
  dependsOnComponentId?: number | null;
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  isTaxable?: boolean;
  isMandatory: boolean;
  expenseAccountId?: number | null;
  expenseAccountName?: string | null;
  liabilityAccountId?: number | null;
  liabilityAccountName?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  sortOrder: number;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
}
