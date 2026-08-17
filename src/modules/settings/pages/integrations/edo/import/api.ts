import { $axiosPrivate } from "@/services/AxiosService";
import { edoImportEndpoints } from "./endpoints";
import type {
  EdoImportBulkDraftStartRequestDto,
  EdoImportBulkDraftStatusDto,
  EdoImportCandidateDetailDto,
  EdoImportCandidateListDto,
  EdoImportCandidateMappingRequestDto,
  EdoImportCandidateQueryDto,
  EdoImportDraftBatchRequestDto,
  EdoImportDraftBatchResponseDto,
  EdoImportDraftFailureApplyRequestDto,
  EdoImportDraftFailureApplyResponseDto,
  EdoImportDraftFailureListDto,
  EdoImportDraftPlanDto,
  EdoImportDraftRequeueRequestDto,
  EdoImportDraftRequeueResponseDto,
  EdoImportJobDto,
  EdoImportMappingSummaryDto,
  EdoImportMarkingConflictApplyRequestDto,
  EdoImportMarkingConflictApplyResponseDto,
  EdoImportMarkingConflictPlanDto,
  EdoImportMasterDataApplyRequestDto,
  EdoImportMasterDataApplyResponseDto,
  EdoImportMasterDataPlanDto,
  EdoImportPagedResponse,
  EdoImportPieceTrackingApplyRequestDto,
  EdoImportPieceTrackingApplyResponseDto,
  EdoImportPieceTrackingPlanDto,
  EdoImportPreflightRequestDto,
  EdoImportProductConflictApplyRequestDto,
  EdoImportProductConflictApplyResponseDto,
  EdoImportProductConflictPlanDto,
  EdoImportProductDefaultsApplyRequestDto,
} from "./types";

export const edoImportService = {
  preflight: (payload: EdoImportPreflightRequestDto) =>
    $axiosPrivate
      .post<EdoImportJobDto>(edoImportEndpoints.preflight, payload)
      .then((response) => response.data),

  job: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportJobDto>(edoImportEndpoints.job(jobId))
      .then((response) => response.data),

  cancelJob: (jobId: string | number) =>
    $axiosPrivate
      .post<EdoImportJobDto>(edoImportEndpoints.cancelJob(jobId))
      .then((response) => response.data),

  candidates: (
    jobId: string | number,
    params: EdoImportCandidateQueryDto,
  ) =>
    $axiosPrivate
      .get<EdoImportPagedResponse<EdoImportCandidateListDto>>(
        edoImportEndpoints.candidates(jobId),
        { params },
      )
      .then((response) => response.data),

  candidate: (jobId: string | number, candidateId: string | number) =>
    $axiosPrivate
      .get<EdoImportCandidateDetailDto>(
        edoImportEndpoints.candidate(jobId, candidateId),
      )
      .then((response) => response.data),

  mappingSummary: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportMappingSummaryDto>(
        edoImportEndpoints.mappingSummary(jobId),
      )
      .then((response) => response.data),

  masterDataPlan: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportMasterDataPlanDto>(
        edoImportEndpoints.masterDataPlan(jobId),
      )
      .then((response) => response.data),

  applyMasterData: (
    jobId: string | number,
    payload: EdoImportMasterDataApplyRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportMasterDataApplyResponseDto>(
        edoImportEndpoints.applyMasterData(jobId),
        payload,
      )
      .then((response) => response.data),

  applyProductDefaults: (
    jobId: string | number,
    payload: EdoImportProductDefaultsApplyRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportMasterDataApplyResponseDto>(
        edoImportEndpoints.applyProductDefaults(jobId),
        payload,
      )
      .then((response) => response.data),

  saveCandidateMapping: (
    jobId: string | number,
    candidateId: string | number,
    payload: EdoImportCandidateMappingRequestDto,
  ) =>
    $axiosPrivate
      .put<EdoImportCandidateDetailDto>(
        edoImportEndpoints.candidateMapping(jobId, candidateId),
        payload,
      )
      .then((response) => response.data),

  resolveMappings: (jobId: string | number) =>
    $axiosPrivate
      .post<EdoImportJobDto>(edoImportEndpoints.resolveMappings(jobId))
      .then((response) => response.data),

  productConflicts: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportProductConflictPlanDto>(
        edoImportEndpoints.productConflicts(jobId),
      )
      .then((response) => response.data),

  applyProductConflicts: (
    jobId: string | number,
    payload: EdoImportProductConflictApplyRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportProductConflictApplyResponseDto>(
        edoImportEndpoints.applyProductConflicts(jobId),
        payload,
      )
      .then((response) => response.data),

  pieceTrackingPlan: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportPieceTrackingPlanDto>(
        edoImportEndpoints.pieceTrackingPlan(jobId),
      )
      .then((response) => response.data),

  applyPieceTracking: (
    jobId: string | number,
    payload: EdoImportPieceTrackingApplyRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportPieceTrackingApplyResponseDto>(
        edoImportEndpoints.applyPieceTracking(jobId),
        payload,
      )
      .then((response) => response.data),

  markingConflicts: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportMarkingConflictPlanDto>(
        edoImportEndpoints.markingConflicts(jobId),
      )
      .then((response) => response.data),

  applyMarkingConflicts: (
    jobId: string | number,
    payload: EdoImportMarkingConflictApplyRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportMarkingConflictApplyResponseDto>(
        edoImportEndpoints.applyMarkingConflicts(jobId),
        payload,
      )
      .then((response) => response.data),

  importPlan: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportDraftPlanDto>(edoImportEndpoints.importPlan(jobId))
      .then((response) => response.data),

  importDrafts: (
    jobId: string | number,
    payload: EdoImportDraftBatchRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportDraftBatchResponseDto>(
        edoImportEndpoints.importDrafts(jobId),
        payload,
      )
      .then((response) => response.data),

  startBulkImport: (
    jobId: string | number,
    payload: EdoImportBulkDraftStartRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportBulkDraftStatusDto>(
        edoImportEndpoints.startBulkImport(jobId),
        payload,
      )
      .then((response) => response.data),

  bulkImportStatus: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportBulkDraftStatusDto>(
        edoImportEndpoints.bulkImportStatus(jobId),
      )
      .then((response) => response.data),

  cancelBulkImport: (jobId: string | number) =>
    $axiosPrivate
      .post<EdoImportBulkDraftStatusDto>(
        edoImportEndpoints.cancelBulkImport(jobId),
      )
      .then((response) => response.data),

  draftImportFailures: (jobId: string | number) =>
    $axiosPrivate
      .get<EdoImportDraftFailureListDto>(
        edoImportEndpoints.draftImportFailures(jobId),
      )
      .then((response) => response.data),

  applyDraftImportFailures: (
    jobId: string | number,
    payload: EdoImportDraftFailureApplyRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportDraftFailureApplyResponseDto>(
        edoImportEndpoints.applyDraftImportFailures(jobId),
        payload,
      )
      .then((response) => response.data),

  requeueDraftImport: (
    jobId: string | number,
    candidateId: string | number,
    payload: EdoImportDraftRequeueRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoImportDraftRequeueResponseDto>(
        edoImportEndpoints.requeueDraftImport(jobId, candidateId),
        payload,
      )
      .then((response) => response.data),
};
