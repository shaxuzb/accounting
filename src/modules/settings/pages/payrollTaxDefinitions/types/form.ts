import type {
  PayrollTaxBaseType,
  PayrollTaxType,
} from "@/modules/payroll/constants/options";

export interface PayrollTaxDefinitionForm {
  code: string;
  name: string;
  taxType: PayrollTaxType | null;
  baseType: PayrollTaxBaseType | null;
  taxKind: string | null;
  rate: number | null;
  nonResidentRate: number | null;
  exemptionAmount: number | null;
  limitAmount: number | null;
  reducesTaxCode: string | null;
  liabilityAccountId: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}
