import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { branchesService } from "../../services/branchesService";
import type { BranchesForm } from "../../types/form";

interface UpdateArgs {
  id: string | number;
  payload: Partial<BranchesForm>;
}

export const useUpdateBranches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      branchesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.branches.all });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.branches.detail(variables.id),
      });
    },
  });
};
