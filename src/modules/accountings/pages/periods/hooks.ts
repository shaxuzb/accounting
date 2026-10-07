import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { periodService } from "./api";

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
    },
  });
};

export const useClosePeriod = () => usePeriodMutation(periodService.close);
export const useReopenPeriod = () => usePeriodMutation(periodService.reopen);
