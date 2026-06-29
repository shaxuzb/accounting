import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { saleConditionService } from "../api";

export const useGetDetailSaleCondition = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => saleConditionService.detail(id),
    enabled: Boolean(id),
  });
