import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { positionsService } from "../api";
import type { PositionsForm } from "../types/form";

export const useCreatePositions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PositionsForm) => positionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["selectlist"] });
    },
  });
};
