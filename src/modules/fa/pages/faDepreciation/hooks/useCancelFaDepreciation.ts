import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDepreciationService } from "../api";

export const useCancelFaDepreciation = (id: string | number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faDepreciationService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
