import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { pricingConditionService } from "../api";

export const useGetListPricingCondition = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => pricingConditionService.list(params),
    placeholderData: keepPreviousData,
  });
