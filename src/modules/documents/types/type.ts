export interface DocumentRegistryItem {
  id: number;
  organizationId?: number;
  documentTypeId: number;
  documentTypeCode?: string | null;
  documentTypeName?: string | null;
  documentId: number;
  docNumber?: string | null;
  docDate: string;
  amount?: number | null;
  currencyId?: number | null;
  currencyCode?: string | null;
  currencyName?: string | null;
  statusId?: number | null;
  statusCode?: string | null;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string;
  updatedDate?: string;
}
