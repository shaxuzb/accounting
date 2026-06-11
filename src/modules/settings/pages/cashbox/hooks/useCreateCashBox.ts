import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { cashBoxService } from "../api";
import type { CashBoxForm } from "../types/form";



export const useCreateCashBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CashBoxForm) => cashBoxService.create(payload),
    onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
