import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashDocumentKeys } from "../constants/queryKeys";
import { cashDocumentService } from "../services/cashDocumentService";
import type { CashDocumentKind } from "../types/type";

export const useCancelCashDocument = (
  kind: CashDocumentKind,
  id: string | number,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cashDocumentService.cancel(kind, id),
    onSuccess: (data) => {
      queryClient.setQueryData(cashDocumentKeys.detail(kind, id), data);
      queryClient.invalidateQueries({ queryKey: cashDocumentKeys.all });
    },
  });
};
