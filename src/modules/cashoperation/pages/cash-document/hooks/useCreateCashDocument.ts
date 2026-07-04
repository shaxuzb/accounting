import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cashDocumentKeys } from "../constants/queryKeys";
import { cashDocumentService } from "../services/cashDocumentService";
import type { CashDocumentKind } from "../types/type";
import type { CashDocumentForm } from "../types/form";

export const useCreateCashDocument = (kind: CashDocumentKind) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CashDocumentForm) =>
      cashDocumentService.create(kind, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashDocumentKeys.all });
    },
  });
};
