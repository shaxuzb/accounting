import type { QueryParams } from "@/shared/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrAbsenceKeys } from "../constants/queryKeys";
import { hrAbsenceService } from "../services/hrAbsenceService";
import type { HrAbsenceForm } from "../types/form";

export const useHrAbsences = (params?: QueryParams) =>
  useQuery({
    queryKey: hrAbsenceKeys.list(params),
    queryFn: () => hrAbsenceService.list(params),
  });

export const useHrAbsenceTypes = () =>
  useQuery({
    queryKey: hrAbsenceKeys.types,
    queryFn: hrAbsenceService.types,
    staleTime: 10 * 60 * 1000,
  });

export const useHrAbsenceDetail = (id?: number | null) =>
  useQuery({
    queryKey: hrAbsenceKeys.detail(id ?? ""),
    queryFn: () => hrAbsenceService.detail(id as number),
    enabled: Boolean(id),
  });

export const useSaveHrAbsence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
      files,
    }: {
      id?: number | null;
      payload: HrAbsenceForm;
      files: File[];
    }) => {
      if (!id) return hrAbsenceService.create(payload, files);
      const updated = await hrAbsenceService.update(id, payload);
      if (files.length) await hrAbsenceService.addAttachments(id, files);
      return updated;
    },
    onSuccess: async (record) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: hrAbsenceKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: hrAbsenceKeys.detail(record.id),
        }),
      ]);
    },
  });
};

export const useDeleteHrAbsence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrAbsenceService.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: hrAbsenceKeys.lists() }),
  });
};

export const useDeleteHrAbsenceAttachment = (absenceId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) =>
      hrAbsenceService.deleteAttachment(absenceId, attachmentId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: hrAbsenceKeys.detail(absenceId),
        }),
        queryClient.invalidateQueries({ queryKey: hrAbsenceKeys.lists() }),
      ]),
  });
};
