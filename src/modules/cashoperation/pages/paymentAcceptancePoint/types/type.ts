export interface PaymentAcceptancePoint {
  id: number;
  code?: string | null;
  organizationId?: number | null;
  organizationName?: string | null;
  typeId: number;
  typeCode?: string | null;
  typeName?: string | null;
  bankAccountId: number | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  name: string | null;
  merchantId: string | null;
  externalId: string | null;
  serialNumber: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
}
