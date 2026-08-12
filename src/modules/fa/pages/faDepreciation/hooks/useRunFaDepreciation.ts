import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDepreciationService } from "../api";

export const useRunFaDepreciation = () => {
  const queryClient = useQueryClient();

  return useMutation<number, unknown, string>({
    mutationFn: (period) => faDepreciationService.run(period),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
