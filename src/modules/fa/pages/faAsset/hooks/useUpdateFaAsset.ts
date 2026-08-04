import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";
import type { FaAssetUpdatePayload } from "../types/form";
import type { FaAsset } from "../types/type";

interface UpdateArgs {
  id: string | number;
  payload: FaAssetUpdatePayload;
}

export function useUpdateFaAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      faAssetService.update(id, payload),
    onSuccess: (data, variables) => {
      if (data && typeof data === "object") {
        queryClient.setQueryData<FaAsset>(
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
}
