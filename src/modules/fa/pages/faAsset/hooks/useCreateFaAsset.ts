import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";
import type { FaAssetFormValues } from "../types/form";

export const useCreateFaAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaAssetFormValues) => faAssetService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
