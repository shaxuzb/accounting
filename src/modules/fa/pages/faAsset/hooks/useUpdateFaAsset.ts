import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";
import type { FaAssetFormValues } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: FaAssetFormValues;
}

export const useUpdateFaAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faAssetService.update(id, payload as FaAssetFormValues),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
};
