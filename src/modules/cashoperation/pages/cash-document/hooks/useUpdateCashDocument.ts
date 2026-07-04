import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashDocumentKeys } from "../constants/queryKeys";
import { cashDocumentService } from "../services/cashDocumentService";
import type { CashDocumentKind } from "../types/type";
import type { CashDocumentForm } from "../types/form";

export const useUpdateCashDocument = (
  kind: CashDocumentKind,
  id: string | number,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CashDocumentForm>) =>
      cashDocumentService.update(kind, id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(cashDocumentKeys.detail(kind, id), data);
      queryClient.invalidateQueries({ queryKey: cashDocumentKeys.all });
    },
  });
};
