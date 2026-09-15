import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContractResponsiblePersonForm } from "../types/form";
import { contractKeys } from "../constants/queryKeys";
import { contractResponsiblePersonService } from "../services/contractService";

export const useCreateContractResponsiblePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContractResponsiblePersonForm) =>
      contractResponsiblePersonService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.responsiblePerson.all,
      });
      // Shartnoma formasidagi select ham shu ro'yxatdan to'ladi.
      queryClient.invalidateQueries({ queryKey: ["selectlist"] });
    },
  });
};
