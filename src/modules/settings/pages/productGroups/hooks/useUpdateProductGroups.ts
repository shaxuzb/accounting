import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { productGroupsService } from "../api";
import type { ProductGroupsForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<ProductGroupsForm>;
}

export const useUpdateProductGroups = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      productGroupsService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.all,
      });
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.detail(variables.id),
      // });
    },
  });
};
