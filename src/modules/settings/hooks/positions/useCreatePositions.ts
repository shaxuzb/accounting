import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { positionsService } from "../../services/positionsService";
import type { PositionsForm } from "../../types/form";

export const useCreatePositions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PositionsForm) => positionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.positions.all });
    },
  });
};
