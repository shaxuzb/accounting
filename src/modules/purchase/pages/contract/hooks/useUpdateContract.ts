import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContractForm } from "../types/form";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

interface UpdateArgs {
  id: string | number;
  payload: Partial<ContractForm>;
}

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      contractService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.contract.all });
      queryClient.invalidateQueries({
        queryKey: contractKeys.contract.detail(variables.id),
      });
    },
  });
};
