import type {
  PayrollCalculationMethod,
  PayrollComponentType,
  PayrollProrationBasis,
} from "@/modules/payroll/constants/options";

export interface PayrollComponentForm {
  code: string;
  name: string;
  componentType: PayrollComponentType | null;
  calculationMethod: PayrollCalculationMethod | null;
  prorationBasis: PayrollProrationBasis;
  defaultAmount: number | null;
  defaultRate: number | null;
  dependsOnComponentId: number | null;
  minimumAmount: number | null;
  maximumAmount: number | null;
  isTaxable: boolean;
  isMandatory: boolean;
  expenseAccountId: number | null;
  liabilityAccountId: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  sortOrder: number | null;
}
