import type {
  PayrollCalculationMethod,
  PayrollComponentType,
} from "@/modules/payroll/constants/options";

export interface PayrollComponentForm {
  code: string;
  name: string;
  componentType: PayrollComponentType | null;
  calculationMethod: PayrollCalculationMethod | null;
  defaultAmount: number | null;
  defaultRate: number | null;
  isMandatory: boolean;
  expenseAccountId: number | null;
  liabilityAccountId: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  sortOrder: number | null;
}
