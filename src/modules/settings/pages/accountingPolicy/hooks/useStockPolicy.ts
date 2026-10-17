import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { accountingPolicyEndpoints } from "../constants/endpoints";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";

export interface StockPolicy {
  /** Stock may be written off beyond what the records hold (1C «Разрешить списание запасов при отсутствии остатков»). */
  allowNegativeStock: boolean;
}

export const useGetStockPolicy = () => {
  const organizationId = useAppSelector((state) => state.organization.id || null);
  return useQuery({
    queryKey: [...accountingPolicyQueryKeys.stock, organizationId],
    queryFn: async () => (await $axiosPrivate.get<StockPolicy>(accountingPolicyEndpoints.stock)).data,
    enabled: Boolean(organizationId),
  });
};

export const useUpdateStockPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StockPolicy) =>
      (await $axiosPrivate.put<StockPolicy>(accountingPolicyEndpoints.stock, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountingPolicyQueryKeys.stock }),
  });
};
