import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";

interface ChartAccountOption {
  id: number;
  number?: string | number;
  code?: string | number;
  name?: string;
}

export default function useCashChartAccountLabel() {
  const { data: chartAccounts = [] } = useQuery<ChartAccountOption[]>({
    queryKey: [
      "selectlist",
      selectListEndpoints.chartAccountsSelectList,
      undefined,
      {},
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<ChartAccountOption[]>(
        selectListEndpoints.chartAccountsSelectList,
      );
      return data ?? [];
    },
  });

  const chartAccountById = useMemo(
    () =>
      new Map(
        chartAccounts.map((account) => [Number(account.id), account] as const),
      ),
    [chartAccounts],
  );

  return (id?: number | null) => {
    if (id === null || id === undefined) return "-";
    const account = chartAccountById.get(Number(id));
    return account ? chartAccountSelectedLabel(account) : id;
  };
}
