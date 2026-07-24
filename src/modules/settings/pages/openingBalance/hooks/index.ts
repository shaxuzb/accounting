import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { openingBalanceKeys } from "../constants/queryKeys";
import { openingBalanceService } from "../services/openingBalanceService";
import type {
  OpeningBalanceAccountPayload,
  OpeningBalanceHeaderForm,
} from "../types/form";

export const useGetOpeningBalance = () =>
  useQuery({
    queryKey: openingBalanceKeys.current(),
    queryFn: openingBalanceService.current,
    retry: false,
  });

export const useCreateOpeningBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpeningBalanceHeaderForm) =>
      openingBalanceService.create(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: openingBalanceKeys.all }),
  });
};

export const useUpdateOpeningBalance = (id?: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpeningBalanceHeaderForm) => {
      if (!id) throw new Error("Opening balance ID topilmadi");
      return openingBalanceService.update(id, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: openingBalanceKeys.all }),
  });
};

export const useDeleteOpeningBalance = (id?: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!id) throw new Error("Opening balance ID topilmadi");
      return openingBalanceService.delete(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: openingBalanceKeys.all }),
  });
};

export const useGetOpeningBalanceAccount = (
  openingBalanceId: string | number,
  accountId: string | number,
  enabled: boolean,
) =>
  useQuery({
    queryKey: openingBalanceKeys.account(openingBalanceId, accountId),
    queryFn: () =>
      openingBalanceService.accountDetail(openingBalanceId, accountId),
    enabled,
  });

export const useSaveOpeningBalanceAccount = (
  openingBalanceId: string | number,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpeningBalanceAccountPayload) =>
      openingBalanceService.saveAccount(openingBalanceId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: openingBalanceKeys.all }),
  });
};
