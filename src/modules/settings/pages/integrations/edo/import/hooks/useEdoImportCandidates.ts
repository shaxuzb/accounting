import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { edoImportService } from "../api";
import { edoImportQueryKeys } from "../queryKeys";
import type {
  EdoImportCandidateMappingRequestDto,
  EdoImportCandidateQueryDto,
} from "../types";
import {
  hasEdoImportId,
  invalidateEdoImportResolution,
} from "./utils";

export const useEdoImportCandidates = (
  jobId: string | number,
  params: EdoImportCandidateQueryDto,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.candidateList(jobId, params),
    queryFn: () => edoImportService.candidates(jobId, params),
    enabled: enabled && hasEdoImportId(jobId),
    placeholderData: keepPreviousData,
  });

export const useEdoImportCandidate = (
  jobId: string | number,
  candidateId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoImportQueryKeys.candidate(jobId, candidateId),
    queryFn: () => edoImportService.candidate(jobId, candidateId),
    enabled:
      enabled && hasEdoImportId(jobId) && hasEdoImportId(candidateId),
  });

export const useSaveEdoImportCandidateMapping = (
  jobId: string | number,
  candidateId: string | number,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EdoImportCandidateMappingRequestDto) =>
      edoImportService.saveCandidateMapping(jobId, candidateId, payload),
    onSuccess: async (candidate) => {
      queryClient.setQueryData(
        edoImportQueryKeys.candidate(jobId, candidateId),
        candidate,
      );
      await invalidateEdoImportResolution(queryClient, jobId);
    },
  });
};
