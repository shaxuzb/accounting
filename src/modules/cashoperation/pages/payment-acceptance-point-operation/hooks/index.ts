import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentAcceptancePointOperationService } from "../services/paymentAcceptancePointOperationService";
import type { PaymentAcceptancePointOperationRequest } from "../types/form";
import { paymentAcceptancePointOperationKeys } from "../constants/queryKeys";

const paramsKey = (params?: URLSearchParams) => params?.toString?.() ?? params;

export const useGetPaymentAcceptancePointOperations = (params?: URLSearchParams) =>
  useQuery({
    queryKey: paymentAcceptancePointOperationKeys.list(paramsKey(params)),
    queryFn: () => paymentAcceptancePointOperationService.list(params),
  });

export const useGetPaymentAcceptancePointOperation = (id: string | number) =>
  useQuery({
    queryKey: paymentAcceptancePointOperationKeys.detail(id),
    queryFn: () => paymentAcceptancePointOperationService.detail(id),
    enabled: Boolean(id),
  });

export const useGetPaymentAcceptancePointBalance = (params?: URLSearchParams) =>
  useQuery({
    queryKey: paymentAcceptancePointOperationKeys.balance(paramsKey(params)),
    queryFn: () => paymentAcceptancePointOperationService.balance(params),
    enabled: Boolean(params?.get("paymentAcceptancePointId") && params?.get("currencyId")),
  });

export const useCreatePaymentAcceptancePointOperation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentAcceptancePointOperationRequest) =>
      paymentAcceptancePointOperationService.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: paymentAcceptancePointOperationKeys.all }),
  });
};

export const useUpdatePaymentAcceptancePointOperation = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentAcceptancePointOperationRequest) =>
      paymentAcceptancePointOperationService.update(id, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: paymentAcceptancePointOperationKeys.all }),
  });
};

export const useConfirmPaymentAcceptancePointOperation = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => paymentAcceptancePointOperationService.confirm(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: paymentAcceptancePointOperationKeys.all }),
  });
};

export const useCancelPaymentAcceptancePointOperation = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => paymentAcceptancePointOperationService.cancel(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: paymentAcceptancePointOperationKeys.all }),
  });
};
