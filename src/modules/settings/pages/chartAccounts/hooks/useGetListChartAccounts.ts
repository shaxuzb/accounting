import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { chartAccountsService } from "../api";

export const useGetListChartAccounts = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => chartAccountsService.list(params),
    placeholderData: keepPreviousData,
  });
