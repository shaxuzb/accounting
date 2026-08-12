import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";
import type { FaAssetUpdatePayload } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: FaAssetUpdatePayload;
}

export function useUpdateFaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faAssetService.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}
