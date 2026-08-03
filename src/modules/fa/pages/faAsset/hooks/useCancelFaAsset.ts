import { useMutation, useQueryClient } from "@tanstack/react-query";
import { faAssetService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export function useCancelFaAsset(id: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => faAssetService.cancel(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.detail(id), data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}
