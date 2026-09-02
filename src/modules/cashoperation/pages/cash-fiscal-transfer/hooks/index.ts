import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cashFiscalTransferService } from "../services/cashFiscalTransferService";
import type { CashFiscalTransferRequest } from "../types/form";
import { cashFiscalTransferKeys } from "../constants/queryKeys";

const paramsKey = (params?: URLSearchParams) => params?.toString?.() ?? params;

export const useGetCashFiscalTransfers = (params?: URLSearchParams) =>
  useQuery({
    queryKey: cashFiscalTransferKeys.list(paramsKey(params)),
    queryFn: () => cashFiscalTransferService.list(params),
  });

export const useGetCashFiscalTransfer = (id: string | number) =>
  useQuery({
    queryKey: cashFiscalTransferKeys.detail(id),
    queryFn: () => cashFiscalTransferService.detail(id),
    enabled: Boolean(id),
  });

export const useCreateCashFiscalTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CashFiscalTransferRequest) =>
      cashFiscalTransferService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashFiscalTransferKeys.all }),
  });
};

export const useUpdateCashFiscalTransfer = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CashFiscalTransferRequest) =>
      cashFiscalTransferService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashFiscalTransferKeys.all }),
  });
};

export const useConfirmCashFiscalTransfer = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cashFiscalTransferService.confirm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashFiscalTransferKeys.all }),
  });
};

export const useCancelCashFiscalTransfer = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cashFiscalTransferService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashFiscalTransferKeys.all }),
  });
};
