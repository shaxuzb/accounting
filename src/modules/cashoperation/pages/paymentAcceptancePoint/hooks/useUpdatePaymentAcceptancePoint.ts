import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentAcceptancePointService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { PaymentAcceptancePointUpdatePayload } from "../types/form";

interface UpdatePaymentAcceptancePointArgs {
  id: string | number;
  payload: PaymentAcceptancePointUpdatePayload;
}

export const useUpdatePaymentAcceptancePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePaymentAcceptancePointArgs) =>
      paymentAcceptancePointService.update(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
