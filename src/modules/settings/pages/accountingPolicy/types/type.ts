export type SourceStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PolicyFieldMetadata<T> {
  value: T | null;
  sourceStatus: SourceStatus;
  sourceEvidence?: string | null;
  requiresBusinessDecision: boolean;
  affectedModule?: string | null;
  implementationDependency?: string | null;
}

export interface AccountingPolicyCurrentDto {
  organizationId: number;
  general: {
    accountingStartDate: PolicyFieldMetadata<string>;
    fiscalYearStartMonth: PolicyFieldMetadata<number>;
  };
  inventory: {
    inventoryValuationMethod: PolicyFieldMetadata<string>;
  };
  currency: {
    baseCurrencyId: PolicyFieldMetadata<number>;
    baseCurrencyCode: PolicyFieldMetadata<string>;
    currencyRevaluationService: PolicyFieldMetadata<string>;
    revaluationScope: PolicyFieldMetadata<string>;
  };
  vat: {
    isVatPayer: PolicyFieldMetadata<boolean>;
    taxTypeId: PolicyFieldMetadata<number>;
    vatTaxPeriod: PolicyFieldMetadata<string>;
    vatBaseMoment: PolicyFieldMetadata<string>;
    activeVatRateCatalog: PolicyFieldMetadata<string>;
  };
  payroll: {
    payrollComponentModel: PolicyFieldMetadata<string>;
    individualTaxPolicy: PolicyFieldMetadata<string>;
    socialTaxPolicy: PolicyFieldMetadata<string>;
  };
  production: {
    productionEnabled: PolicyFieldMetadata<boolean>;
    productionOutputAccountId: PolicyFieldMetadata<number>;
    outputAccountCode: PolicyFieldMetadata<string>;
  };
  costing: {
    costAllocationMethod: PolicyFieldMetadata<string>;
  };
  accounts: {
    documentAccountSettingsCount: PolicyFieldMetadata<number>;
  };
  governance: {
    effectiveFrom: PolicyFieldMetadata<string>;
    effectiveTo: PolicyFieldMetadata<string>;
    policyVersioning: PolicyFieldMetadata<boolean>;
    closedPeriodPolicy: PolicyFieldMetadata<string>;
  };
  inventoryValuationMethod: string | null;
  baseCurrencyId: number | null;
  baseCurrencyCode: string | null;
  accountingStartDate: string | null;
  fiscalYearStartMonth: number | null;
  isVatPayer: boolean | null;
  taxTypeId: number | null;
  vatTaxPeriod: string | null;
  vatBaseMoment: string | null;
  productionEnabled: boolean | null;
  foreignCurrencyEnabled: boolean | null;
  foreignCurrency: string | null;
  costAllocationMethod: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  policyVersioning: boolean | null;
  closedPeriodPolicy: string | null;
  sourceStatus: SourceStatus;
  sourceEvidence?: string | null;
  requiresBusinessDecision: boolean;
  affectedModule?: string | null;
  implementationDependency?: string | null;
}

export interface AccountingPolicyVersionDto {
  organizationId: number;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  inventoryValuationMethod: string | null;
  baseCurrencyId: number | null;
  vatPayer: boolean | null;
  taxTypeId: number | null;
  vatTaxPeriod: string | null;
  vatBaseMoment: string | null;
  closedPeriodPolicy: string | null;
}

export interface AccountingPolicyHistoryDto {
  organizationId: number;
  items: AccountingPolicyVersionDto[];
  sourceStatus: SourceStatus;
  sourceEvidence?: string | null;
  requiresBusinessDecision: boolean;
  affectedModule?: string | null;
  implementationDependency?: string | null;
}

export interface AccountingPolicyImpactDto {
  organizationId: number;
  effectiveOn: string;
  documentType: string | null;
  policy: AccountingPolicyCurrentDto | null;
  existingDocumentsRecalculated: boolean;
  sourceStatus: SourceStatus;
  sourceEvidence?: string | null;
  requiresBusinessDecision: boolean;
  affectedModule?: string | null;
  implementationDependency?: string | null;
}

export interface AccountingPolicyUpdateRequest {
  inventoryValuationMethod: "FIFO";
  baseCurrencyId: 1;
  vatPayer: true;
  taxTypeId: number | null;
  vatTaxPeriod: "MONTH";
  vatBaseMoment: "SHIPMENT";
  effectiveFrom: string;
  effectiveTo: string | null;
  productionEnabled: boolean | null;
  foreignCurrencyEnabled: boolean | null;
  costAllocationMethod: string | null;
  closedPeriodPolicy: "PROTECT_CLOSED_PERIOD";
}

export type AccountingPolicyFormValues = AccountingPolicyUpdateRequest;

export interface TaxType {
  id: number;
  name: string;
  code: string | null;
}

export interface VatRate {
  id: number;
  name: string;
  code: string | null;
}
