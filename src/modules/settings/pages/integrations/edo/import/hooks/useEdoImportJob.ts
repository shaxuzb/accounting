import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoImportService } from "../api";
import { edoImportQueryKeys } from "../queryKeys";
import type { EdoImportJobDto } from "../types";
import { hasEdoImportId } from "./utils";
import { syncActiveEdoImportJob } from "@/store/middleware/edoImportLogoutCleanup";

const terminalStatuses = new Set<EdoImportJobDto["status"]>([
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

const jobPollingInterval = (query: {
  state: { data?: EdoImportJobDto };
}) =>
  query.state.data && terminalStatuses.has(query.state.data.status)
    ? false
    : 15_000;

export const useCreateEdoImportPreflight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: edoImportService.preflight,
    onSuccess: (job) => {
      syncActiveEdoImportJob(job.id, job.status);
      queryClient.setQueryData(edoImportQueryKeys.job(job.id), job);
    },
  });
};

export const useEdoImportJob = (
  jobId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.job(jobId),
    queryFn: async () => {
      const job = await edoImportService.job(jobId);
      syncActiveEdoImportJob(job.id, job.status);
      return job;
    },
    enabled: enabled && hasEdoImportId(jobId),
    refetchInterval: jobPollingInterval,
  });

export const useCancelEdoImportJob = (jobId: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => edoImportService.cancelJob(jobId),
    onSuccess: (job) => {
      syncActiveEdoImportJob(job.id, job.status);
      queryClient.setQueryData(edoImportQueryKeys.job(jobId), job);
    },
  });
};
