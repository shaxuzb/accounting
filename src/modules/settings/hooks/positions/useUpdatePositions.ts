import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { positionsService } from "../../services/positionsService";
import type { PositionsForm } from "../../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<PositionsForm>;
}

export const useUpdatePositions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      positionsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.positions.all });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.positions.detail(variables.id),
      });
    },
  });
};
