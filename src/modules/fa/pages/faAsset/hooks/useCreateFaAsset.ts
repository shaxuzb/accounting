import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";
import type { FaAssetCreatePayload } from "../types/form";

export function useCreateFaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FaAssetCreatePayload) =>
      faAssetService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}
