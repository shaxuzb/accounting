import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";

export const useDeleteFaAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => faAssetService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
