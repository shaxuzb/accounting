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
  /** NDFL, INPS or SOCIAL — a statutory tax whose rate the tax regime gives; null for an own tax. */
  taxKind?: string | null;
  rate: number;
  nonResidentRate?: number | null;
  /** The rate the organization's tax regime gives it today, when the regime rates it. */
  regimeRate?: number | null;
  regimeNonResidentRate?: number | null;
  regimeName?: string | null;
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
