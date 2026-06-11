import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { branchesService } from "../api";
import type { BranchesForm } from "../types/form";

export const useCreateBranches = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchesForm) => branchesService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
};
