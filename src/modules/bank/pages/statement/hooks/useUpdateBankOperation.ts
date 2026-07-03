import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankQueryKeys } from "../constants/queryKeys";
import { bankStatementParserService } from "../services/bankStatementParserService";
import type { BankOperationCreatePayload } from "../types/form";

interface UpdateArgs {
  id: string | number;
  payload: BankOperationCreatePayload;
}

export const useUpdateBankOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateArgs) =>
      bankStatementParserService.updateOperation(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(bankQueryKeys.operations.detail(variables.id), data);
      queryClient.invalidateQueries({
        queryKey: bankQueryKeys.operations.all,
      });
    },
  });
};
