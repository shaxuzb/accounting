import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { branchesService } from "../../services/branchesService";
import type { BranchesForm } from "../../types/form";

export const useCreateBranches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchesForm) => branchesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.branches.all });
    },
  });
};
