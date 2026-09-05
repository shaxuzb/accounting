export const accountingPolicyQueryKeys = {
  all: ["accounting-policy"] as const,
  current: (effectiveOn?: string) =>
    ["accounting-policy", "current", effectiveOn] as const,
  history: (dateFrom?: string, dateTo?: string) =>
    ["accounting-policy", "history", dateFrom, dateTo] as const,
  impact: (effectiveOn: string, documentType?: string) =>
    ["accounting-policy", "impact", effectiveOn, documentType] as const,
  taxTypes: ["accounting-policy", "tax-types"] as const,
  vatRates: ["accounting-policy", "vat-rates"] as const,
};
