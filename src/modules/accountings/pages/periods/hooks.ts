import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { periodService } from "./api";
import { $axiosPrivate } from "@/services/AxiosService";

export interface SequenceRestoreResult {
  boundaryDate?: string | null;
  issueCount: number;
  documentCount: number;
  costBefore: number;
  costAfter: number;
}

/**
 * 1C «Восстановление последовательности»: the stock issues from the boundary on given out again
 * by FIFO in date order and their entries rebuilt; the month close waits for it.
 */
export const useRestoreSequence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await $axiosPrivate.post<SequenceRestoreResult>("/inventory-sequence/restore")).data,
    onError: errorHandlers,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounting-period-close-check"] });
      void queryClient.invalidateQueries({ queryKey: ["inventory-sequence"] });
    },
  });
};

export const useSequenceBoundary = () =>
  useQuery({
    queryKey: ["inventory-sequence"],
    queryFn: async () => (await $axiosPrivate.get<{ boundaryDate?: string | null }>("/inventory-sequence")).data,
  });

export const usePeriods = (year: number) =>
  useQuery({
    queryKey: ["accounting-periods", year],
    queryFn: () => periodService.list(year),
  });

export const useCloseCheck = (id: number | null) =>
  useQuery({
    queryKey: ["accounting-period-close-check", id],
    queryFn: () => periodService.closeCheck(id!),
    enabled: !!id,
  });

export const useRecloseRequired = () =>
  useQuery({
    queryKey: ["accounting-periods", "reclose-required"],
    queryFn: periodService.recloseRequired,
  });

export const useReopenPreview = (id: number | null) =>
  useQuery({
    queryKey: ["accounting-period-reopen-preview", id],
    queryFn: () => periodService.reopenPreview(id!),
    enabled: !!id,
  });

const usePeriodMutation = <T,>(action: (id: number) => Promise<T>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onError: errorHandlers,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounting-periods"] });
      void queryClient.invalidateQueries({ queryKey: ["accounting-period-close-check"] });
      void queryClient.invalidateQueries({ queryKey: ["accounting-period-reopen-preview"] });
      // the close restores the stock sequence itself
      void queryClient.invalidateQueries({ queryKey: ["inventory-sequence"] });
    },
  });
};

export const useClosePeriod = () => usePeriodMutation(periodService.close);
export const useReopenPeriod = () => usePeriodMutation(periodService.reopen);
