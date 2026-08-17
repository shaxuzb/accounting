import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoImportService } from "../api";
import { edoImportQueryKeys } from "../queryKeys";
import type {
  EdoImportMarkingConflictApplyRequestDto,
  EdoImportPieceTrackingApplyRequestDto,
  EdoImportProductConflictApplyRequestDto,
} from "../types";
import {
  hasEdoImportId,
  invalidateEdoImportResolution,
  isStaleEdoImportPlanError,
} from "./utils";

export const useEdoImportProductConflicts = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.productConflicts(jobId),
    queryFn: () => edoImportService.productConflicts(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

export const useApplyEdoImportProductConflicts = (
  jobId: string | number,
) => {
  const queryClient = useQueryClient();
  const invalidatePlan = () =>
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.productConflicts(jobId),
    });

  return useMutation({
    mutationFn: (payload: EdoImportProductConflictApplyRequestDto) =>
      edoImportService.applyProductConflicts(jobId, payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        invalidatePlan(),
        queryClient.invalidateQueries({
          queryKey: edoImportQueryKeys.pieceTrackingPlan(jobId),
        }),
        invalidateEdoImportResolution(queryClient, jobId),
      ]);
    },
    onError: (error) => {
      if (isStaleEdoImportPlanError(error)) void invalidatePlan();
    },
  });
};

export const useEdoImportPieceTrackingPlan = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.pieceTrackingPlan(jobId),
    queryFn: () => edoImportService.pieceTrackingPlan(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

export const useApplyEdoImportPieceTracking = (jobId: string | number) => {
  const queryClient = useQueryClient();
  const invalidatePlan = () =>
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.pieceTrackingPlan(jobId),
    });

  return useMutation({
    mutationFn: (payload: EdoImportPieceTrackingApplyRequestDto) =>
      edoImportService.applyPieceTracking(jobId, payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        invalidatePlan(),
        invalidateEdoImportResolution(queryClient, jobId),
      ]);
    },
    onError: (error) => {
      if (isStaleEdoImportPlanError(error)) void invalidatePlan();
    },
  });
};

export const useEdoImportMarkingConflicts = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.markingConflicts(jobId),
    queryFn: () => edoImportService.markingConflicts(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

export const useApplyEdoImportMarkingConflicts = (
  jobId: string | number,
) => {
  const queryClient = useQueryClient();
  const invalidatePlan = () =>
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.markingConflicts(jobId),
    });

  return useMutation({
    mutationFn: (payload: EdoImportMarkingConflictApplyRequestDto) =>
      edoImportService.applyMarkingConflicts(jobId, payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        invalidatePlan(),
        invalidateEdoImportResolution(queryClient, jobId),
      ]);
    },
    onError: (error) => {
      if (isStaleEdoImportPlanError(error)) void invalidatePlan();
    },
  });
};
