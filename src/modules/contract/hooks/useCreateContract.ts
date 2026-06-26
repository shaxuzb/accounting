import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContractForm } from "../types/form";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContractForm) => contractService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contract.all,
      });
    },
  });
};
