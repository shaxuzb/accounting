import { useQuery } from "@tanstack/react-query";
import { purchaseServiceService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListPurchaseService = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => purchaseServiceService.list(params),
  });
