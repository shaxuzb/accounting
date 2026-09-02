import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentAcceptancePointService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { PaymentAcceptancePointCreatePayload } from "../types/form";

export const useCreatePaymentAcceptancePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentAcceptancePointCreatePayload) =>
      paymentAcceptancePointService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });
};
