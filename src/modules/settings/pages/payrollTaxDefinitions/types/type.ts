import type {
  PayrollTaxBaseType,
  PayrollTaxType,
} from "@/modules/payroll/constants/options";

export interface PayrollTaxDefinition {
  id: number;
  organizationId: number;
  code: string;
  name: string;
  taxType: PayrollTaxType;
  baseType: PayrollTaxBaseType;
  rate: number;
  exemptionAmount?: number | null;
  limitAmount?: number | null;
  reducesTaxCode?: string | null;
  liabilityAccountId: number;
  liabilityAccountNumber?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  stateId?: number | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}
