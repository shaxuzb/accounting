import { useQuery } from "@tanstack/react-query";
import { purchaseKeys } from "@/modules/purchases/constants/queryKeys";
import { PurchaseDetailData } from "@/modules/purchases/types/purchase";
import { purchaseService } from "../services/purchaseService";

export const useGetDetailPurchase = (id: number) => {
  return useQuery<PurchaseDetailData>({
    queryKey: [purchaseKeys.GET_DETAIL, id],
    queryFn: () => purchaseService.detail(id),
    enabled: !!id,
  });
};






