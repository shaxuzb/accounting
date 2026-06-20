import { $axiosPrivate } from "@/services/AxiosService";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useQuery } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import type { VatRateOption } from "../types/type";

export const useVatRates = () =>
  useQuery({
    queryKey: saleKeys.manuals.vatRates,
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<VatRateOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
