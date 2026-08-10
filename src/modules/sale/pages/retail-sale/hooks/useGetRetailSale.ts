import { useQuery } from "@tanstack/react-query";
import { retailSaleKeys } from "../constants/queryKeys";
import { retailSaleService } from "../services/retailSaleService";

export const useGetRetailSale = (id: string | number) =>
  useQuery({
    queryKey: retailSaleKeys.detail(id),
    queryFn: () => retailSaleService.detail(id),
    enabled: Boolean(id),
  });
