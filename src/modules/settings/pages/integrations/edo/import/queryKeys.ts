import type { EdoImportCandidateQueryDto } from "./types";

export const edoImportQueryKeys = {
  all: ["settings", "integrations", "edo", "imports"] as const,
  jobs: () => [...edoImportQueryKeys.all, "jobs"] as const,
  job: (jobId: string | number) =>
    [...edoImportQueryKeys.jobs(), jobId] as const,
  candidates: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "candidates"] as const,
  candidateList: (
    jobId: string | number,
    params: EdoImportCandidateQueryDto,
  ) => [...edoImportQueryKeys.candidates(jobId), "list", params] as const,
  candidate: (jobId: string | number, candidateId: string | number) =>
    [...edoImportQueryKeys.candidates(jobId), "detail", candidateId] as const,
  mappingSummary: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "mapping-summary"] as const,
  masterDataPlan: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "master-data-plan"] as const,
  productConflicts: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "product-conflicts"] as const,
  pieceTrackingPlan: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "piece-tracking-plan"] as const,
  markingConflicts: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "marking-conflicts"] as const,
  importPlan: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "import-plan"] as const,
  bulkImportStatus: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "bulk-import-status"] as const,
  draftImportFailures: (jobId: string | number) =>
    [...edoImportQueryKeys.job(jobId), "draft-import-failures"] as const,
};
