import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";
import type { FaAssetForm } from "../types/form";

export function useCreateFaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaAssetForm) => faAssetService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
