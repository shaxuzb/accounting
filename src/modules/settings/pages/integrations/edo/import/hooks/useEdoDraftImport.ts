import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoImportService } from "../api";
import { edoImportQueryKeys } from "../queryKeys";
import type {
  EdoImportBulkDraftStartRequestDto,
  EdoImportBulkDraftStatusDto,
  EdoImportDraftBatchRequestDto,
  EdoImportDraftFailureApplyRequestDto,
  EdoImportDraftRequeueRequestDto,
} from "../types";
import {
  hasEdoImportId,
  invalidateEdoImportCandidates,
  invalidateEdoImportJob,
  isStaleEdoImportPlanError,
} from "./utils";

const activeBulkStatuses = new Set<EdoImportBulkDraftStatusDto["status"]>([
  "QUEUED",
  "RUNNING",
  "CANCEL_REQUESTED",
]);

const bulkPollingInterval = (query: {
  state: { data?: EdoImportBulkDraftStatusDto };
}) =>
  query.state.data && !activeBulkStatuses.has(query.state.data.status)
    ? false
    : 15_000;

const invalidateDraftState = (
  queryClient: ReturnType<typeof useQueryClient>,
  jobId: string | number,
) =>
  Promise.all([
    invalidateEdoImportJob(queryClient, jobId),
    invalidateEdoImportCandidates(queryClient, jobId),
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.importPlan(jobId),
    }),
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.draftImportFailures(jobId),
    }),
  ]);

export const useEdoImportDraftPlan = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.importPlan(jobId),
    queryFn: () => edoImportService.importPlan(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

export const useImportEdoDrafts = (jobId: string | number) => {
  const queryClient = useQueryClient();
  const invalidatePlan = () =>
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.importPlan(jobId),
    });

  return useMutation({
    mutationFn: (payload: EdoImportDraftBatchRequestDto) =>
      edoImportService.importDrafts(jobId, payload),
    retry: false,
    onSuccess: async () => {
      await invalidateDraftState(queryClient, jobId);
    },
    onError: (error) => {
      if (isStaleEdoImportPlanError(error)) void invalidatePlan();
    },
  });
};

export const useStartEdoBulkImport = (jobId: string | number) => {
  const queryClient = useQueryClient();
  const invalidatePlan = () =>
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.importPlan(jobId),
    });

  return useMutation({
    mutationFn: (payload: EdoImportBulkDraftStartRequestDto) =>
      edoImportService.startBulkImport(jobId, payload),
    retry: false,
    onSuccess: async (status) => {
      queryClient.setQueryData(
        edoImportQueryKeys.bulkImportStatus(jobId),
        status,
      );
      await invalidateDraftState(queryClient, jobId);
    },
    onError: (error) => {
      if (isStaleEdoImportPlanError(error)) void invalidatePlan();
    },
  });
};

export const useEdoBulkImportStatus = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.bulkImportStatus(jobId),
    queryFn: () => edoImportService.bulkImportStatus(jobId),
    enabled: enabled && hasEdoImportId(jobId),
    refetchInterval: bulkPollingInterval,
  });

export const useCancelEdoBulkImport = (jobId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => edoImportService.cancelBulkImport(jobId),
    onSuccess: async (status) => {
      queryClient.setQueryData(
        edoImportQueryKeys.bulkImportStatus(jobId),
        status,
      );
      await invalidateDraftState(queryClient, jobId);
    },
  });
};

export const useEdoImportDraftFailures = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.draftImportFailures(jobId),
    queryFn: () => edoImportService.draftImportFailures(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

export const useApplyEdoImportDraftFailures = (
  jobId: string | number,
) => {
  const queryClient = useQueryClient();
  const invalidateFailures = () =>
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.draftImportFailures(jobId),
    });

  return useMutation({
    mutationFn: (payload: EdoImportDraftFailureApplyRequestDto) =>
      edoImportService.applyDraftImportFailures(jobId, payload),
    retry: false,
    onSuccess: async () => {
      await invalidateDraftState(queryClient, jobId);
    },
    onError: (error) => {
      if (isStaleEdoImportPlanError(error)) void invalidateFailures();
    },
  });
};

export const useRequeueEdoImportDraft = (
  jobId: string | number,
  candidateId: string | number,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EdoImportDraftRequeueRequestDto) =>
      edoImportService.requeueDraftImport(jobId, candidateId, payload),
    onSuccess: async () => {
      await Promise.all([
        invalidateDraftState(queryClient, jobId),
        queryClient.invalidateQueries({
          queryKey: edoImportQueryKeys.candidate(jobId, candidateId),
        }),
      ]);
    },
  });
};
