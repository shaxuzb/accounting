import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { saleConditionService } from "../api";

export const useGetListSaleCondition = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => saleConditionService.list(params),
    placeholderData: keepPreviousData,
  });
