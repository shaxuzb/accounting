import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { branchesService } from "../api";
import type { BranchesForm } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<BranchesForm>;
}

export const useUpdateBranches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      branchesService.update(id, payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.detail(variables.id),
      // });
    },
  });
};
