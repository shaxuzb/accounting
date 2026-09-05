export interface AccountingPolicyHistoryQuery {
  dateFrom?: string;
  dateTo?: string;
}

export interface AccountingPolicyImpactQuery {
  effectiveOn: string;
  documentType?: string;
}

export const buildAccountingPolicyHistoryQuery = ({
  dateFrom,
  dateTo,
}: AccountingPolicyHistoryQuery) => {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  return params;
};

export const buildAccountingPolicyImpactQuery = ({
  effectiveOn,
  documentType,
}: AccountingPolicyImpactQuery) => {
  const params = new URLSearchParams();
  if (effectiveOn) params.set("effectiveOn", effectiveOn);
  if (documentType) params.set("documentType", documentType);
  return params;
};
