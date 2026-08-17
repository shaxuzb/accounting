const edoImportsBase = "purchase-docs/edo-imports";

export const edoImportEndpoints = {
  preflight: `${edoImportsBase}/preflight`,
  job: (jobId: string | number) => `${edoImportsBase}/${jobId}`,
  cancelJob: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/cancel`,
  candidates: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/documents`,
  candidate: (jobId: string | number, candidateId: string | number) =>
    `${edoImportsBase}/${jobId}/documents/${candidateId}`,
  mappingSummary: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/mapping-summary`,
  masterDataPlan: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/master-data-plan`,
  applyMasterData: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/master-data/apply`,
  applyProductDefaults: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/master-data/products/apply-defaults`,
  candidateMapping: (
    jobId: string | number,
    candidateId: string | number,
  ) => `${edoImportsBase}/${jobId}/documents/${candidateId}/mapping`,
  resolveMappings: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/resolve-mappings`,
  productConflicts: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/product-conflicts`,
  applyProductConflicts: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/product-conflicts/apply`,
  pieceTrackingPlan: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/piece-tracking-plan`,
  applyPieceTracking: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/piece-tracking/apply`,
  markingConflicts: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/marking-conflicts`,
  applyMarkingConflicts: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/marking-conflicts/apply`,
  importPlan: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/import-plan`,
  importDrafts: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/import-drafts`,
  startBulkImport: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/bulk-import/start`,
  bulkImportStatus: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/bulk-import/status`,
  cancelBulkImport: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/bulk-import/cancel`,
  draftImportFailures: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/draft-import-failures`,
  applyDraftImportFailures: (jobId: string | number) =>
    `${edoImportsBase}/${jobId}/draft-import-failures/apply`,
  requeueDraftImport: (
    jobId: string | number,
    candidateId: string | number,
  ) =>
    `${edoImportsBase}/${jobId}/documents/${candidateId}/requeue-draft-import`,
} as const;
