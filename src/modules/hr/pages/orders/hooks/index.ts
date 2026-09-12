import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollEmployeeKeys } from "@/modules/settings/pages/payrollEmployees/constants/queryKeys";
import { hrOrderKeys } from "../constants/queryKeys";
import { hrOrderService } from "../services/hrOrderService";
import type { PayrollHrOrderForm } from "../types/form";

export const useHrOrders = (params?: URLSearchParams) =>
  useQuery({
    queryKey: hrOrderKeys.list(params?.toString()),
    queryFn: () => hrOrderService.list(params),
    placeholderData: keepPreviousData,
  });

export const useHrOrderDetail = (id?: string | number | null) =>
  useQuery({
    queryKey: hrOrderKeys.detail(id ?? ""),
    queryFn: () => hrOrderService.detail(id as string | number),
    enabled: Boolean(id),
  });

export const useHrOrderPrint = (id?: string | number | null) =>
  useQuery({
    queryKey: hrOrderKeys.print(id ?? ""),
    queryFn: () => hrOrderService.print(id as string | number),
    enabled: Boolean(id),
  });

const invalidateOrdersAndEmployees = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: hrOrderKeys.all }),
    queryClient.invalidateQueries({ queryKey: payrollEmployeeKeys.all }),
  ]);
};

export const useCreateHrOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: PayrollHrOrderForm) => hrOrderService.create(payload), onSuccess: () => invalidateOrdersAndEmployees(queryClient) });
};

export const useUpdateHrOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string | number; payload: PayrollHrOrderForm }) => hrOrderService.update(id, payload), onSuccess: () => invalidateOrdersAndEmployees(queryClient) });
};

const createActionHook = (action: (id: string | number) => Promise<unknown>) => {
  return () => {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: (id: string | number) => action(id), onSuccess: () => invalidateOrdersAndEmployees(queryClient) });
  };
};

export const useConfirmHrOrder = createActionHook(hrOrderService.confirm);
export const useCancelHrOrder = createActionHook(hrOrderService.cancel);
export const useDeleteHrOrder = createActionHook(hrOrderService.delete);
