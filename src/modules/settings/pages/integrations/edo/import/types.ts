export type EdoImportJobStatus =
  | "QUEUED"
  | "SCANNING"
  | "WAITING_AUTH"
  | "PREFLIGHT_READY"
  | "IMPORTING"
  | "PARTIAL"
  | "COMPLETED"
  | "FAILED"
  | "CANCEL_REQUESTED"
  | "CANCELLED";

export type EdoImportBulkStatus =
  | "QUEUED"
  | "RUNNING"
  | "PAUSED"
  | "CANCEL_REQUESTED"
  | "CANCELLED"
  | "COMPLETED";

export type EdoImportMasterDataAction = "CREATE" | "USE_EXISTING";
export type EdoImportMarkingConflictAction = "SKIP";
export type EdoImportDraftFailureAction = "SKIP" | "MARK_DUPLICATE";

export interface EdoImportPreflightRequestDto {
  dateFrom?: string | null;
  dateTo: string;
}

export interface EdoImportProviderDto {
  providerCode: string;
  status: string;
  currentPage: number;
  pageSize: number;
  scannedCount: number;
  providerTotal?: number | null;
  isWaitingAuth: boolean;
  safeErrorCode?: string | null;
}

export interface EdoImportJobDto {
  id: number;
  dateFrom: string;
  dateTo: string;
  status: EdoImportJobStatus;
  discoveredCount: number;
  readyCount: number;
  mappingRequiredCount: number;
  duplicateCount: number;
  skippedCount: number;
  safeErrorCode?: string | null;
  providers: EdoImportProviderDto[];
}

export interface EdoImportCandidateQueryDto {
  page: number;
  pageSize: number;
}

export interface EdoImportPagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount?: number | null;
  totalPages?: number | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface EdoImportCandidateListDto {
  id: number;
  providerCode: string;
  providerDocumentId: string;
  documentNumber?: string | null;
  documentDate?: string | null;
  sellerTin?: string | null;
  sellerName?: string | null;
  totalAmount?: number | null;
  status: string;
  mappingStatus: string;
  duplicateState: string;
  existingPurchaseId?: number | null;
  safeErrorCode?: string | null;
}

export interface EdoImportCandidateLineDto {
  number: number;
  catalogCode?: string | null;
  providerProductName?: string | null;
  packageCode?: string | null;
  packageName?: string | null;
  isService?: boolean | null;
  quantity?: number | null;
  unitPrice?: number | null;
  netAmount?: number | null;
  vatRate?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  productId?: number | null;
  unitId?: number | null;
  vatRateId?: number | null;
  debitAccountId?: number | null;
  vatAccountId?: number | null;
  mappingStatus: string;
}

export interface EdoImportCandidateDetailDto
  extends EdoImportCandidateListDto {
  buyerTin?: string | null;
  providerContractNumber?: string | null;
  providerContractDate?: string | null;
  netAmount?: number | null;
  vatAmount?: number | null;
  counterpartyId?: number | null;
  contractId?: number | null;
  currencyId?: number | null;
  warehouseId?: number | null;
  lines: EdoImportCandidateLineDto[];
}

export interface EdoImportMissingSellerSummaryDto {
  sellerTin?: string | null;
  sellerName?: string | null;
  candidateCount: number;
}

export interface EdoImportMissingContractSummaryDto {
  sellerTin?: string | null;
  counterpartyId: number;
  providerContractNumber?: string | null;
  providerContractDate?: string | null;
  candidateCount: number;
}

export interface EdoImportMissingProductSummaryDto {
  catalogCode?: string | null;
  providerProductName?: string | null;
  itemType?: string | null;
  packageCode?: string | null;
  packageName?: string | null;
  isService?: boolean | null;
  vatRate?: number | null;
  candidateCount: number;
}

export interface EdoImportMappingIssueCountsDto {
  counterparty: number;
  contract: number;
  product: number;
  currency: number;
  warehouse: number;
  unit: number;
  vatRate: number;
  marking: number;
}

export interface EdoImportMissingMasterDataDto {
  type: string;
  candidateCount: number;
}

export interface EdoImportMappingSummaryDto {
  jobId: number;
  totalCandidates: number;
  readyCount: number;
  duplicateCount: number;
  mappingRequiredCount: number;
  safeErrorCodeCounts: Record<string, number>;
  missingSellers: EdoImportMissingSellerSummaryDto[];
  missingContracts: EdoImportMissingContractSummaryDto[];
  missingProducts: EdoImportMissingProductSummaryDto[];
  issueCounts: EdoImportMappingIssueCountsDto;
  missingMasterData: EdoImportMissingMasterDataDto[];
}

export interface EdoImportCandidateLineMappingRequestDto {
  lineNumber: number;
  productId?: number | null;
  unitId?: number | null;
  vatRateId?: number | null;
  debitAccountId?: number | null;
  vatAccountId?: number | null;
}

export interface EdoImportCandidateMappingRequestDto {
  counterpartyId?: number | null;
  contractId?: number | null;
  currencyId?: number | null;
  warehouseId?: number | null;
  lines: EdoImportCandidateLineMappingRequestDto[];
}

export interface EdoImportMasterDataCounterpartyPlanItemDto {
  sellerTin?: string | null;
  canonicalSellerName?: string | null;
  nameAliases: string[];
  candidateCount: number;
  existingCounterpartyId?: number | null;
  action: string;
}

export interface EdoImportMasterDataContractPlanItemDto {
  providerCode: string;
  sellerTin?: string | null;
  counterpartyId?: number | null;
  providerContractNumber?: string | null;
  providerContractDate?: string | null;
  candidateCount: number;
  candidateIds: number[];
  existingContractId?: number | null;
  reconciliationContractIds: number[];
  action: string;
}

export interface EdoImportMasterDataProductPlanItemDto {
  catalogCode?: string | null;
  providerProductName?: string | null;
  packageCode?: string | null;
  packageName?: string | null;
  isService?: boolean | null;
  resolvedUnitId?: number | null;
  resolvedVatRateId?: number | null;
  markingRequired: boolean;
  candidateCount: number;
  existingProductId?: number | null;
  action: string;
  blockedReasonCodes: string[];
}

export interface EdoImportMasterDataPlanDto {
  jobId: number;
  planHash: string;
  counterparties: EdoImportMasterDataCounterpartyPlanItemDto[];
  contracts: EdoImportMasterDataContractPlanItemDto[];
  products: EdoImportMasterDataProductPlanItemDto[];
  markingRequiredCount: number;
  blockedReasonCodes: string[];
  createCount: number;
  useExistingCount: number;
  conflictCount: number;
  blockedCount: number;
}

export interface EdoImportMasterDataCounterpartyApplyItemDto {
  sellerTin: string;
  action: EdoImportMasterDataAction;
  existingCounterpartyId?: number | null;
}

export interface EdoImportMasterDataContractApplyItemDto {
  sellerTin: string;
  providerContractNumber: string;
  providerContractDate: string;
  candidateIds: number[];
  action: EdoImportMasterDataAction;
  existingContractId?: number | null;
}

export interface EdoImportMasterDataProductApplyItemDto {
  catalogCode: string;
  action: EdoImportMasterDataAction;
  existingProductId?: number | null;
  isService?: boolean | null;
  isPieceTracked?: boolean | null;
  unitId?: number | null;
  vatRateId?: number | null;
}

export interface EdoImportMasterDataApplyRequestDto {
  confirm: true;
  expectedPlanHash: string;
  counterparties: EdoImportMasterDataCounterpartyApplyItemDto[];
  contracts: EdoImportMasterDataContractApplyItemDto[];
  products: EdoImportMasterDataProductApplyItemDto[];
}

export interface EdoImportPackageUnitMappingDto {
  packageName: string;
  unitId: number;
}

export interface EdoImportProductDefaultsApplyRequestDto {
  confirm: true;
  expectedPlanHash: string;
  packageUnitMappings: EdoImportPackageUnitMappingDto[];
  markingPolicy: "PIECE_TRACKED_WHEN_REQUIRED";
}

export interface EdoImportMasterDataApplyResponseDto {
  jobId: number;
  createdCounterpartyCount: number;
  reusedCounterpartyCount: number;
  createdContractCount: number;
  reusedContractCount: number;
  createdProductCount: number;
  reusedProductCount: number;
  readyCount: number;
  mappingRequiredCount: number;
  conflictCount: number;
  blockedCount: number;
  safeErrorCodes: string[];
}

export interface EdoImportCompatibleProductDto {
  productId: number;
  name: string;
  isService: boolean;
  isPieceTracked: boolean;
  unitId: number;
  vatRateId?: number | null;
  compatibilityCodes: string[];
}

export interface EdoImportProductConflictItemDto {
  identityKey: string;
  catalogCode?: string | null;
  packageCode?: string | null;
  packageName?: string | null;
  providerProductName?: string | null;
  providerCode: string;
  itemType: string;
  isService?: boolean | null;
  vatRate?: number | null;
  resolvedVatRateId?: number | null;
  candidateCount: number;
  markedCandidateCount: number;
  markingRequired: boolean;
  blockedReasonCodes: string[];
  compatibleProducts: EdoImportCompatibleProductDto[];
}

export interface EdoImportProductConflictPlanDto {
  jobId: number;
  planHash: string;
  items: EdoImportProductConflictItemDto[];
}

export interface EdoImportProductConflictApplyItemDto {
  identityKeys: string[];
  action: EdoImportMasterDataAction;
  existingProductId?: number | null;
  isService?: boolean | null;
  unitId?: number | null;
  vatRateId?: number | null;
  isPieceTracked: boolean;
  confirmItemTypeOverride: boolean;
}

export interface EdoImportProductConflictApplyRequestDto {
  confirm: true;
  expectedPlanHash: string;
  items: EdoImportProductConflictApplyItemDto[];
}

export interface EdoImportProductConflictApplyResponseDto {
  jobId: number;
  createdProductCount: number;
  reusedProductCount: number;
  createdMappingCount: number;
  reusedMappingCount: number;
  readyCount: number;
  mappingRequiredCount: number;
}

export interface EdoImportPieceTrackingProductDto {
  productId: number;
  productName: string;
  catalogCode: string;
  affectedCandidateCount: number;
  markingCount: number;
  isService: boolean;
  isPieceTracked: boolean;
  safeAction: string;
}

export interface EdoImportPieceTrackingPlanDto {
  jobId: number;
  planHash: string;
  products: EdoImportPieceTrackingProductDto[];
}

export interface EdoImportPieceTrackingApplyRequestDto {
  confirm: true;
  expectedPlanHash: string;
  productIds: number[];
}

export interface EdoImportPieceTrackingApplyResponseDto {
  jobId: number;
  updatedProductCount: number;
  reusedProductCount: number;
  readyCount: number;
  mappingRequiredCount: number;
  failedCount: number;
}

export interface EdoImportMarkingConflictItemDto {
  candidateId: number;
  documentNumber?: string | null;
  documentDate?: string | null;
  safeErrorCode: string;
  expectedQuantity?: number | null;
  actualMarkingCount: number;
  conflictCount: number;
  existingPurchaseIds: number[];
}

export interface EdoImportMarkingConflictPlanDto {
  jobId: number;
  conflictHash: string;
  items: EdoImportMarkingConflictItemDto[];
}

export interface EdoImportMarkingConflictApplyItemDto {
  candidateId: number;
  action: EdoImportMarkingConflictAction;
}

export interface EdoImportMarkingConflictApplyRequestDto {
  confirm: true;
  expectedConflictHash: string;
  items: EdoImportMarkingConflictApplyItemDto[];
}

export interface EdoImportMarkingConflictApplyResponseDto {
  jobId: number;
  skippedCandidateCount: number;
  readyCount: number;
  mappingRequiredCount: number;
  duplicateCount: number;
  skippedCount: number;
}

export interface EdoImportDraftProviderSummaryDto {
  providerCode: string;
  readyCount: number;
}

export interface EdoImportDraftPlanDto {
  jobId: number;
  jobStatus: string;
  importPlanHash: string;
  totalCandidates: number;
  readyCount: number;
  mappingRequiredCount: number;
  duplicateCount: number;
  importedCount: number;
  failedCount: number;
  skippedCount: number;
  readyNetAmount: number;
  readyVatAmount: number;
  readyTotalAmount: number;
  markedCandidateCount: number;
  earliestDocumentDate?: string | null;
  latestDocumentDate?: string | null;
  providers: EdoImportDraftProviderSummaryDto[];
}

export interface EdoImportDraftBatchRequestDto {
  confirm: true;
  expectedImportPlanHash: string;
  batchSize: number;
}

export interface EdoImportDraftFailureSummaryDto {
  safeErrorCode: string;
  count: number;
}

export interface EdoImportDraftBatchResponseDto {
  jobId: number;
  jobStatus: string;
  processedCandidateCount: number;
  createdDraftCount: number;
  reusedDraftCount: number;
  failedCandidateCount: number;
  remainingReadyCount: number;
  importedCount: number;
  failedCount: number;
  failures: EdoImportDraftFailureSummaryDto[];
}

export interface EdoImportBulkDraftStartRequestDto {
  confirm: true;
  expectedImportPlanHash: string;
  batchSize: 50;
  lineValuesInvalidPolicy: "SKIP";
  markingAlreadyUsedPolicy: "MARK_DUPLICATE_IF_ALL_SAME_PURCHASE_ELSE_SKIP";
}

export interface EdoImportBulkDraftStatusDto {
  jobId: number;
  status: EdoImportBulkStatus;
  processedCount: number;
  createdDraftCount: number;
  reusedDraftCount: number;
  duplicateCount: number;
  skippedCount: number;
  failedCount: number;
  remainingReadyCount: number;
  lastSafeErrorCode?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface EdoImportDraftFailureItemDto {
  candidateId: number;
  documentNumber?: string | null;
  documentDate?: string | null;
  safeErrorCode: string;
  totalMarkingCount: number;
  usedMarkingCount: number;
  existingPurchaseIds: number[];
}

export interface EdoImportDraftFailureListDto {
  jobId: number;
  failureHash: string;
  items: EdoImportDraftFailureItemDto[];
}

export interface EdoImportDraftFailureApplyItemDto {
  candidateId: number;
  action: EdoImportDraftFailureAction;
}

export interface EdoImportDraftFailureApplyRequestDto {
  confirm: true;
  expectedFailureHash: string;
  items: EdoImportDraftFailureApplyItemDto[];
}

export interface EdoImportDraftFailureApplyResponseDto {
  jobId: number;
  skippedCandidateCount: number;
  markedDuplicateCandidateCount: number;
  readyCount: number;
  mappingRequiredCount: number;
  duplicateCount: number;
  importedCount: number;
  failedCount: number;
  skippedCount: number;
}

export interface EdoImportDraftRequeueRequestDto {
  confirm: true;
}

export interface EdoImportDraftRequeueResponseDto {
  jobId: number;
  candidateId: number;
  candidateStatus: string;
  requeued: boolean;
  readyCount: number;
  failedCount: number;
}
