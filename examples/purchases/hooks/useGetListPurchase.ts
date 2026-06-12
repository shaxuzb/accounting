import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "../services/purchaseService";
import { purchaseKeys } from "@/modules/purchases/constants/queryKeys";
import { PurchaseQueryProps } from "@/modules/purchases/types/purchase";

export const useGetListPurchase = (searchParams?: URLSearchParams) => {
  return useQuery<PurchaseQueryProps>({
    queryKey: [purchaseKeys.GET_LIST, searchParams?.toString()],
    queryFn: () => purchaseService.list(searchParams),
  });
};





