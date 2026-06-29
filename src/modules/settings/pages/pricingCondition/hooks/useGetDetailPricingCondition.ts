import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { pricingConditionService } from "../api";

export const useGetDetailPricingCondition = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => pricingConditionService.detail(id),
    enabled: Boolean(id),
  });
