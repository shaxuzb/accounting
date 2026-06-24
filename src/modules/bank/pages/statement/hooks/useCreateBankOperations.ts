import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankQueryKeys } from "../constants/queryKeys";
import { bankStatementParserService } from "../services/bankStatementParserService";
import type { BankOperationsCreatePayload } from "../types/type";

export const useCreateBankOperations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BankOperationsCreatePayload) =>
      bankStatementParserService.createManyOperations(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: bankQueryKeys.operations.all,
      });
    },
  });
};
