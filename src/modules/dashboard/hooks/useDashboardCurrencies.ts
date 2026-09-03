import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import type { SelectData } from "@/shared/types";

export function useDashboardCurrencies() {
  return useQuery({
    queryKey: [selectListKeys.currency],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectData[]>(
        selectListEndpoints.currenciesSelectList,
      );
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
