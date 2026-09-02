import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cashCollectionService } from "../services/cashCollectionService";
import type { CashCollectionRequest } from "../types/form";
import { cashCollectionKeys } from "../constants/queryKeys";

const paramsKey = (params?: URLSearchParams) => params?.toString?.() ?? params;

export const useGetCashCollections = (params?: URLSearchParams) =>
  useQuery({
    queryKey: cashCollectionKeys.list(paramsKey(params)),
    queryFn: () => cashCollectionService.list(params),
  });

export const useGetCashCollectionsInTransit = (params?: URLSearchParams) =>
  useQuery({
    queryKey: cashCollectionKeys.inTransit(paramsKey(params)),
    queryFn: () => cashCollectionService.inTransit(params),
  });

export const useGetCashCollection = (id: string | number) =>
  useQuery({
    queryKey: cashCollectionKeys.detail(id),
    queryFn: () => cashCollectionService.detail(id),
    enabled: Boolean(id),
  });

export const useCreateCashCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CashCollectionRequest) =>
      cashCollectionService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashCollectionKeys.all }),
  });
};

export const useUpdateCashCollection = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CashCollectionRequest) =>
      cashCollectionService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashCollectionKeys.all }),
  });
};

export const useSendCashCollectionToBank = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cashCollectionService.sendToBank(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashCollectionKeys.all }),
  });
};

export const useCancelCashCollection = (id: string | number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cashCollectionService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashCollectionKeys.all }),
  });
};

export const useDeleteCashCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => cashCollectionService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cashCollectionKeys.all }),
  });
};
