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

const usePeriodMutation = (action: (id: number) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onError: errorHandlers,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["accounting-periods"] });
      void queryClient.invalidateQueries({ queryKey: ["accounting-period-close-check"] });
    },
  });
};

export const useClosePeriod = () => usePeriodMutation(periodService.close);
export const useReopenPeriod = () => usePeriodMutation(periodService.reopen);
