export type EdoProviderCode = "DIDOX" | "FAKTURA" | "EDOCS";

export type EdoDocumentDirection = "INBOX" | "OUTBOX";

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
  | "ListOutbox"
  | "ListDrafts"
  | "ListAll"
  | "AggregateAll"
  | "GetDetail"
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

export interface EdoFrontendCapabilitiesDto {
  canListInbox: EdoCapabilityStatus;
  canListOutbox: EdoCapabilityStatus;
  canListDrafts: EdoCapabilityStatus;
  canListAll: EdoCapabilityStatus;
  canAggregateAll: EdoCapabilityStatus;
  canGetDetail: EdoCapabilityStatus;
  canGetFile: EdoCapabilityStatus;
  canGetStatus: EdoCapabilityStatus;
  canCreate: EdoCapabilityStatus;
  canSign: EdoCapabilityStatus;
  canReject: EdoCapabilityStatus;
  canDelete: EdoCapabilityStatus;
  canRestore: EdoCapabilityStatus;
  canExport: EdoCapabilityStatus;
  canMarking: EdoCapabilityStatus;
}

export interface EdoCategoryCapabilityDto {
  category: EdoDocumentCategory;
  capability: EdoCapabilityStatus;
}

export interface EdoStatusCapabilityDto {
  status: EdoDocumentStatusCode;
  capability: EdoCapabilityStatus;
}

export type EdoFilterCode =
  | "Page"
  | "PageSize"
  | "Status"
  | "Search"
  | "HasMarks"
  | "DateFrom"
  | "DateTo"
  | "Category"
  | (string & {});

export interface EdoFilterCapabilityDto {
  direction?: EdoDocumentDirection | null;
  category: EdoDocumentCategory;
  filter: EdoFilterCode;
  capability: EdoCapabilityStatus;
}

export interface EdoStatusOptionDto {
  direction?: EdoDocumentDirection | null;
  category: EdoDocumentCategory;
  code: EdoDocumentStatusCode;
  sendsProviderStatus: boolean;
  capability: EdoCapabilityStatus;
}

export interface EdoCapabilitiesResponseDto {
  provider: EdoProviderCode;
  displayName: string;
  authModes: string[];
  signingModes: string[];
  capabilities: EdoFrontendCapabilitiesDto;
  categoryCapabilities: EdoCategoryCapabilityDto[];
  statusCapabilities: EdoStatusCapabilityDto[];
  filterCapabilities: EdoFilterCapabilityDto[];
  statusOptions: EdoStatusOptionDto[];
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
  certificateSerialNumber?: string | null;
  signedPayload?: string | null;
  preparedPkcs7?: string | null;
  signatureHex?: string | null;
}

export interface EdoFakturaAuthCompleteRequestDto {
  preparedPkcs7?: string | null;
  rememberMe: boolean;
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
  districtId?: number | string | null;
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
  | "ALL"
  | "UNKNOWN"
  | "PENDING_SIGNATURE"
  | "PARTNER_SIGNATURE_PENDING"
  | "AGENT_SIGNATURE_PENDING"
  | "DRAFT"
  | "PENDING"
  | "SIGNED"
  | "SENT"
  | "RECEIVED"
  | "REJECTED"
  | "DELETED"
  | "ARCHIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "RECONCILIATION_REQUIRED";

export type EdoDocumentCategory =
  | "INBOX"
  | "OUTBOX"
  | "DRAFTS"
  | "REJECTED"
  | "DELETED_ARCHIVED"
  | "ALL";

export interface EdoDocumentStatusDto {
  code: EdoDocumentStatusCode;
  localCode?: string | null;
  providerStatusCode?: string | null;
  providerRawStatus?: string | null;
  description?: string | null;
  isTerminal: boolean;
  isSuccessful: boolean;
  checkedAt?: string | null;
  isReconciliationRequired: boolean;
}

export interface EdoDocumentDto {
  id: number;
  statusCheckable: boolean;
  providerCode: EdoProviderCode;
  documentIdentity?: string | null;
  providerDocumentId?: string | null;
  direction: EdoDocumentDirection;
  category: EdoDocumentCategory;
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
  markingCodes: string[];
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

export interface EdoDocumentListQueryDto {
  page: number;
  pageSize: number;
  search?: string;
  hasMarks?: boolean;
  status?: EdoDocumentStatusCode;
  dateFrom?: string;
  dateTo?: string;
}

export type EdoInboxQueryDto = EdoDocumentListQueryDto;
export type EdoOutboxQueryDto = EdoDocumentListQueryDto;

export interface EdoAllDocumentsQueryDto extends EdoDocumentListQueryDto {
  category?: EdoDocumentCategory;
}

export interface EdoPagedDocumentResponse {
  items: EdoDocumentDto[];
  page: number;
  pageSize: number;
  totalCount?: number | null;
  totalPages?: number | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export type EdoInboxListDto = EdoPagedDocumentResponse;

export interface EdoProviderDocumentStatusResponseDto {
  documentIdentity: string;
  providerDocumentId: string;
  providerCode: EdoProviderCode;
  direction: EdoDocumentDirection;
  status: EdoDocumentStatusDto;
}

export interface EdoPublicStatusCountsDto {
  received?: number | null;
  signed?: number | null;
  rejected?: number | null;
  draft?: number | null;
  sent?: number | null;
  deleted?: number | null;
  archived?: number | null;
  pendingSignature?: number | null;
  partnerSignaturePending?: number | null;
  agentSignaturePending?: number | null;
}

export interface EdoPublicInboxSummaryDto {
  provider: EdoProviderCode;
  inbox: EdoPublicStatusCountsDto;
  outbox: EdoPublicStatusCountsDto;
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
  isPdf: boolean;
}

export interface EdoProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}
