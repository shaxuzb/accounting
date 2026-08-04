import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectOptionItem } from "@/components/fields/SelectCustom";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";

type SelectResponse = SelectOptionItem[] | { items?: SelectOptionItem[] };

export default function useFaAssetLookups() {
  const lang = useAppSelector((state) => state.lang.lang);
  const { data: accounts = [] } = useQuery<SelectOptionItem[]>({
    queryKey: [
      "selectlist",
      lang,
      selectListEndpoints.chartAccountsSelectList,
      undefined,
      {},
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectResponse>(
        selectListEndpoints.chartAccountsSelectList,
      );
      return Array.isArray(data) ? data : (data.items ?? []);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  const accountsById = useMemo(
    () => new Map(accounts.map((account) => [Number(account.id), account])),
    [accounts],
  );

  const accountLabel = useCallback(
    (id?: number | null) => {
      if (id == null) return "-";
      const account = accountsById.get(Number(id));
      return account
        ? chartAccountSelectedLabel(account) ||
            getLocalizedLabel(account, lang) ||
            String(id)
        : String(id);
    },
    [accountsById, lang],
  );

  return { accountLabel };
}
