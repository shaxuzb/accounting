import { isAxiosError } from "axios";
import type { QueryClient } from "@tanstack/react-query";
import { edoImportQueryKeys } from "../queryKeys";

export const hasEdoImportId = (id: string | number) => Number(id) > 0;

export const isStaleEdoImportPlanError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 409;

export const invalidateEdoImportJob = (
  queryClient: QueryClient,
  jobId: string | number,
) =>
  queryClient.invalidateQueries({
    queryKey: edoImportQueryKeys.job(jobId),
    exact: true,
  });

export const invalidateEdoImportCandidates = (
  queryClient: QueryClient,
  jobId: string | number,
) =>
  queryClient.invalidateQueries({
    queryKey: edoImportQueryKeys.candidates(jobId),
  });

export const invalidateEdoImportResolution = (
  queryClient: QueryClient,
  jobId: string | number,
) =>
  Promise.all([
    invalidateEdoImportJob(queryClient, jobId),
    invalidateEdoImportCandidates(queryClient, jobId),
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.mappingSummary(jobId),
    }),
    queryClient.invalidateQueries({
      queryKey: edoImportQueryKeys.importPlan(jobId),
    }),
  ]);
