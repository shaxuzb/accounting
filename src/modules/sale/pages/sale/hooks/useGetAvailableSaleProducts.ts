import { useQuery } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";

export const useGetAvailableSaleProducts = (id: string | number) =>
  useQuery({
    queryKey: saleKeys.saleDoc.availableProducts(id),
    queryFn: () => saleDocService.availableProducts(id),
    enabled: Boolean(id),
  });
