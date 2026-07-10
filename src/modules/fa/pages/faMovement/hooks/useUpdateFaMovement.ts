import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";
import type { FaMovementFormValues } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: FaMovementFormValues;
}

export const useUpdateFaMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faMovementService.update(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
