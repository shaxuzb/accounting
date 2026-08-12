import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { faCommissioningService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { FaCommissioningPayload } from "../types/type";

export const useGetListFaCommissionings = (params?: URLSearchParams) => useQuery({
  queryKey: queryKeys.list(params?.toString()),
  queryFn: () => faCommissioningService.list(params),
  placeholderData: keepPreviousData,
});

export const useGetDetailFaCommissioning = (id: string | number) => useQuery({
  queryKey: queryKeys.detail(id),
  queryFn: () => faCommissioningService.detail(id),
  enabled: Boolean(id),
});

export const useCreateFaCommissioning = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload: FaCommissioningPayload) => faCommissioningService.create(payload), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.lists() }) });
};

export const useUpdateFaCommissioning = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string | number; payload: FaCommissioningPayload }) => faCommissioningService.update(id, payload), onSuccess: (_, variables) => { void client.invalidateQueries({ queryKey: queryKeys.detail(variables.id) }); void client.invalidateQueries({ queryKey: queryKeys.lists() }); } });
};

const useCommissioningAction = (action: "confirm" | "cancel") => {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string | number) => faCommissioningService[action](id), onSuccess: (_, id) => { void client.invalidateQueries({ queryKey: queryKeys.detail(id) }); void client.invalidateQueries({ queryKey: queryKeys.lists() }); } });
};

export const useConfirmFaCommissioning = () => useCommissioningAction("confirm");
export const useCancelFaCommissioning = () => useCommissioningAction("cancel");
