import { useQuery } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleService } from "../services/saleService";
import type { SaleDocListParams } from "../types/type";

export const useGetListSale = (
  params?: SaleDocListParams | URLSearchParams,
) =>
  useQuery({
    queryKey: saleKeys.docs.list(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => saleService.list(params),
    // placeholderData: keepPreviousData,
  });
