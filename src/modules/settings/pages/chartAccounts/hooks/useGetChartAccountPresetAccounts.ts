import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { chartAccountsService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import type { QueryParams } from "@/shared/types/api";

export const useGetChartAccountPresetAccounts = (
  params?: QueryParams,
  enabled = true,
) =>
  useQuery({
    queryKey: queryKeys.presetAccounts(params),
    queryFn: () => chartAccountsService.presetAccounts(params),
    placeholderData: keepPreviousData,
    enabled,
  });
