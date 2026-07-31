import { useMutation, useQueryClient } from "@tanstack/react-query";
import { faAssetService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export function useConfirmFaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => faAssetService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
    },
  });
}
