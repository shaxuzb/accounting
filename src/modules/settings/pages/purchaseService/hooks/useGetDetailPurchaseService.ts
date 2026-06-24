import { useQuery } from "@tanstack/react-query";
import { purchaseServiceService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailPurchaseService = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => purchaseServiceService.detail(id),
    enabled: Boolean(id),
  });
