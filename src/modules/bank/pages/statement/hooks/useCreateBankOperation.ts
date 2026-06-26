import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankQueryKeys } from "../constants/queryKeys";
import { bankStatementParserService } from "../services/bankStatementParserService";
import type { BankOperationCreatePayload } from "../types/form";

export const useCreateBankOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BankOperationCreatePayload) =>
      bankStatementParserService.createOperation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankQueryKeys.operations.all,
      });
    },
  });
};
