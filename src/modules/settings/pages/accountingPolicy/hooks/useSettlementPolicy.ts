import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { accountingPolicyEndpoints } from "../constants/endpoints";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";

export interface SettlementPolicy {
  /** Debt and advances are kept per contract rather than per counterparty. */
  settlementsByContract: boolean;
}

export const useGetSettlementPolicy = () => {
  const organizationId = useAppSelector((state) => state.organization.id || null);
  return useQuery({
    queryKey: [...accountingPolicyQueryKeys.settlements, organizationId],
    queryFn: async () =>
      (await $axiosPrivate.get<SettlementPolicy>(accountingPolicyEndpoints.settlements)).data,
    enabled: Boolean(organizationId),
  });
};

export const useUpdateSettlementPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SettlementPolicy) =>
      (await $axiosPrivate.put<SettlementPolicy>(accountingPolicyEndpoints.settlements, payload)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountingPolicyQueryKeys.settlements }),
  });
};
