import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bankQueryKeys } from "../constants/queryKeys";
import { bankStatementParserService } from "../services/bankStatementParserService";

export const useCancelBankOperation = (id: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => bankStatementParserService.cancelOperation(id),
    onSuccess: (data) => {
      queryClient.setQueryData(bankQueryKeys.operations.detail(id), data);
      queryClient.invalidateQueries({ queryKey: bankQueryKeys.operations.all });
    },
  });
};
