import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { saleConditionService } from "../api";

export const useGetNowSaleCondition = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.now,
    queryFn: () => saleConditionService.now(),
    enabled,
  });
