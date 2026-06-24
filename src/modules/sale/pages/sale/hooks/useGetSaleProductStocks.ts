import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { saleKeys } from "../constants/queryKeys";
import { productStockService } from "../services/productStockService";

export const useGetSaleProductStocks = (
  params?: ListParams | URLSearchParams,
) =>
  useQuery({
    queryKey: saleKeys.productStock.products(params),
    queryFn: () => productStockService.products(params),
    placeholderData: keepPreviousData,
  });
