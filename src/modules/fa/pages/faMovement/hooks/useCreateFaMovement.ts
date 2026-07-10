import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";
import type { FaMovementFormValues } from "../types/form";

export const useCreateFaMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaMovementFormValues) =>
      faMovementService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
