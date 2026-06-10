import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { chartAccountsService } from "../../services/chartAccountsService";

export const useGetListChartAccounts = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.chartAccounts.list(params),
    queryFn: () => chartAccountsService.list(params as any),
    placeholderData: keepPreviousData,
  });
