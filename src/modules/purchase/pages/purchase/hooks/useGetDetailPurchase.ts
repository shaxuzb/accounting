import { useQuery } from "@tanstack/react-query";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";

export const useGetDetailPurchase = (id: string | number) =>
  useQuery({
    queryKey: purchaseKeys.purchase.detail(id),
    queryFn: () => purchaseService.detail(id),
    enabled: Boolean(id),
  });
