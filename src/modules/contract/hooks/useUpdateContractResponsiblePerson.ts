import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContractResponsiblePersonForm } from "../types/form";
import { contractKeys } from "../constants/queryKeys";
import { contractResponsiblePersonService } from "../services/contractService";

interface UpdateArgs {
  id: string | number;
  payload: ContractResponsiblePersonForm;
}

export const useUpdateContractResponsiblePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      contractResponsiblePersonService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.responsiblePerson.all,
      });
      queryClient.invalidateQueries({ queryKey: ["selectlist"] });
      // Ism o'zgarsa ro'yxatdagi responsiblePersonName ham eskiradi.
      queryClient.invalidateQueries({ queryKey: contractKeys.contract.all });
    },
  });
};
