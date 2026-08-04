import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";
import type { FaMovement, FaMovementPayload } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaMovementPayload;
}

export const useUpdateFaMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faMovementService.update(id, payload),
    onSuccess: (data, variables) => {
      if (data && typeof data === "object") {
        queryClient.setQueryData<FaMovement>(
          queryKeys.detail(variables.id),
          (current) => ({
            ...current,
            ...data,
            id: data.id ?? current?.id ?? Number(variables.id),
          }),
        );
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};
