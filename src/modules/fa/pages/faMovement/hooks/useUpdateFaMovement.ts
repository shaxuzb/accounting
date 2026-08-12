import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";
import type { FaMovementPayload } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaMovementPayload;
}

export const useUpdateFaMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faMovementService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
