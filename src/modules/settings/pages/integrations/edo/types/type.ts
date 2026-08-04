export type EdoProviderCode = "DIDOX" | "FAKTURA" | "EDOCS";

export type EdoCapabilityStatus =
  | "SUPPORTED"
  | "PARTIAL"
  | "NOT_SUPPORTED"
  | "UNKNOWN";

export type EdoCapabilityKind =
  | "AuthChallenge"
  | "AuthComplete"
  | "CreateFactura"
  | "SignOutbox"
  | "ListInbox"
  | "RejectInbox"
  | "GetFile"
  | "GetOutboxStatus"
  | "GetInboxStatus"
  | string;

export interface EdoCapabilityDto {
  kind: EdoCapabilityKind;
  status: EdoCapabilityStatus;
}

export interface EdoProviderDto {
  id: number;
  name: string;
  code: EdoProviderCode;
}

export interface EdoActiveProviderRequestDto {
  providerCode: EdoProviderCode;
}

export interface EdoAuthChallengeQuery {
  certificateSerialNumber?: string;
  authMode?: string;
}

export interface EdoAuthChallengeDto {
  challengeId: string;
  authMode: string;
  payload: string;
  payloadFormat: string;
  expiresAt: string;
  signingSessionId?: string | null;
}

export interface EdoAuthCompleteRequestDto {
  challengeId: string;
  signingSessionId?: string | null;
  certificateSerialNumber: string;
  signedPayload?: string | null;
  preparedPkcs7: string;
  signatureHex: string;
}

export interface EdoAuthCompleteDto {
  isAuthenticated: boolean;
  sessionId?: string | null;
  expiresAt?: string | null;
}

export interface EdoPartyDto {
  name: string;
  taxIdentifier: string;
  bankCode: string;
  accountNumber: string;
  address: string;
  branchCode?: string | null;
  branchName?: string | null;
  directorName?: string | null;
  accountantName?: string | null;
  vatRegistrationStatus?: string | null;
  districtId?: number | null;
}

export interface EdoEmpowermentDto {
  empowermentNumber: string;
  dateOfIssue: string;
  agentName: string;
  agentPinfl: string;
}

export interface EdoFacturaLineDto {
  number: number;
  name: string;
  catalogCode?: string | null;
  catalogName?: string | null;
  unitCode: string;
  unitName?: string | null;
  quantity: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  isTaxFree: boolean;
  markingCodeIds: string[];
}

export interface EdoOutboxFacturaCreateRequestDto {
  internalDocumentId: number;
  internalDocumentType: string;
  seller: EdoPartyDto;
  buyer: EdoPartyDto;
  documentNumber: string;
  documentDate: string;
  contractNumber?: string | null;
  contractDate?: string | null;
  empowerment?: EdoEmpowermentDto | null;
  lines: EdoFacturaLineDto[];
  idempotencyKey: string;
}

export type EdoDocumentStatusCode =
  | "UNKNOWN"
  | "DRAFT"
  | "PENDING"
  | "SIGNED"
  | "SENT"
  | "RECEIVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "RECONCILIATION_REQUIRED";

export interface EdoDocumentStatusDto {
  code: EdoDocumentStatusCode;
  localCode?: string | null;
  providerStatusCode?: string | null;
  description?: string | null;
  isTerminal: boolean;
  isSuccessful: boolean;
  checkedAt?: string | null;
  isReconciliationRequired: boolean;
}

export interface EdoDocumentDto {
  id: number;
  providerDocumentId?: string | null;
  direction: "INBOX" | "OUTBOX";
  documentType: string;
  documentNumber: string;
  documentDate: string;
  status: EdoDocumentStatusDto;
  seller?: EdoPartyDto | null;
  buyer?: EdoPartyDto | null;
  totalAmount?: number | null;
  currencyCode?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EdoSigningSessionDto {
  sessionId: string;
  signingMode: string;
  documentId: number;
  payload: string;
  payloadFormat: string;
  expiresAt: string;
}

export interface EdoOutboxCreateDto {
  document: EdoDocumentDto;
  signingSession?: EdoSigningSessionDto | null;
  isReplay: boolean;
}

export interface EdoOutboxSignRequestDto {
  idempotencyKey: string;
  certificateSerialNumber?: string | null;
  signingSessionId?: string | null;
  signingMode?: string | null;
  preparedPkcs7?: string | null;
  signatureHex?: string | null;
  hash?: string | null;
}

export interface EdoOutboxSignDto {
  document: EdoDocumentDto;
  signingSession?: EdoSigningSessionDto | null;
}

export interface EdoInboxQueryDto {
  companyInn?: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: EdoDocumentStatusCode;
  fromDate?: string;
  toDate?: string;
}

export interface EdoInboxListDto {
  items: EdoDocumentDto[];
  page: number;
  pageSize: number;
  totalCount?: number | null;
}

export interface EdoInboxRejectRequestDto {
  reason: string;
  idempotencyKey: string;
  signingSessionId?: string | null;
  preparedPkcs7?: string | null;
  signatureHex?: string | null;
}

export interface EdoInboxRejectDto {
  document: EdoDocumentDto;
  signingSession?: EdoSigningSessionDto | null;
}

export interface EdoDownloadedFile {
  blob: Blob;
  fileName: string;
  contentType: string;
}

export interface EdoProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}
