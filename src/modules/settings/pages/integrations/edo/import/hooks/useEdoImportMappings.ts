import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoImportService } from "../api";
import { edoImportQueryKeys } from "../queryKeys";
import type {
  EdoImportMasterDataApplyRequestDto,
  EdoImportProductDefaultsApplyRequestDto,
} from "../types";
import {
  hasEdoImportId,
  invalidateEdoImportResolution,
  isStaleEdoImportPlanError,
} from "./utils";

export const useEdoImportMappingSummary = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.mappingSummary(jobId),
    queryFn: () => edoImportService.mappingSummary(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

export const useEdoImportMasterDataPlan = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.masterDataPlan(jobId),
    queryFn: () => edoImportService.masterDataPlan(jobId),
    enabled: enabled && hasEdoImportId(jobId),
  });

const useInvalidateMasterDataPlan = (jobId: string | number) => {
  const queryClient = useQueryClient();

  return {
    queryClient,
    invalidatePlan: () =>
      queryClient.invalidateQueries({
        queryKey: edoImportQueryKeys.masterDataPlan(jobId),
      }),
  };
};

export const useApplyEdoImportMasterData = (jobId: string | number) => {
  const { queryClient, invalidatePlan } = useInvalidateMasterDataPlan(jobId);

  return useMutation({
    mutationFn: (payload: EdoImportMasterDataApplyRequestDto) =>
      edoImportService.applyMasterData(jobId, payload),
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

export const useApplyEdoImportProductDefaults = (jobId: string | number) => {
  const { queryClient, invalidatePlan } = useInvalidateMasterDataPlan(jobId);

  return useMutation({
    mutationFn: (payload: EdoImportProductDefaultsApplyRequestDto) =>
      edoImportService.applyProductDefaults(jobId, payload),
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

export const useResolveEdoImportMappings = (jobId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => edoImportService.resolveMappings(jobId),
    onSuccess: async (job) => {
      queryClient.setQueryData(edoImportQueryKeys.job(jobId), job);
      await invalidateEdoImportResolution(queryClient, jobId);
    },
  });
};
