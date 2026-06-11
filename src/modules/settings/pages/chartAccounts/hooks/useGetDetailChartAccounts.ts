import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { chartAccountsService } from "../api";

export const useGetDetailChartAccounts = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => chartAccountsService.detail(id),
    enabled: Boolean(id),
  });
