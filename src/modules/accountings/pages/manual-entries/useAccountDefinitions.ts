import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { chartAccountsService } from "@/modules/settings/pages/chartAccounts/api";
import type { SubkontoTypeOption } from "@/modules/settings/pages/openingBalance/types/type";

type SubkontoTypeResponse = SubkontoTypeOption[] | { items?: SubkontoTypeOption[] };

/** The account's analytics, as its chart settings name them (turnover-only ones too). */
export const useAccountDefinitions = (accountId?: number | null) => {
  const account = useQuery({
    queryKey: ["chart-accounts", "detail", accountId],
    queryFn: () => chartAccountsService.detail(Number(accountId)),
    enabled: Boolean(accountId),
    staleTime: 5 * 60 * 1000,
  });
  const types = useQuery({
    queryKey: ["selectlist", selectListEndpoints.subkontoTypes],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SubkontoTypeResponse>(selectListEndpoints.subkontoTypes);
      return Array.isArray(data) ? data : (data.items ?? []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const definitions: SubkontoTypeOption[] = (account.data?.subkontos ?? [])
    .map((definition) => {
      const type = types.data?.find((item) => item.id === definition.subkontoTypeId);
      return {
        id: definition.subkontoTypeId,
        name: type?.name ?? `Subkonto #${definition.subkontoTypeId}`,
        code: type?.code,
        sortOrder: definition.sortOrder,
        isRequired: definition.isRequired,
      };
    })
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

  return { account: account.data, definitions };
};
