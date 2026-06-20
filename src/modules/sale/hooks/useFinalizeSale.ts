import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";
import type { SaleDocForm, SaleDocTableForm } from "../types/type";

interface FinalizeSaleArgs {
  document: SaleDocForm;
  lines: Omit<SaleDocTableForm, "ownerId">[];
}

export const useFinalizeSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ document, lines }: FinalizeSaleArgs) =>
      saleService.createWithLines(document, lines),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
  });
};
