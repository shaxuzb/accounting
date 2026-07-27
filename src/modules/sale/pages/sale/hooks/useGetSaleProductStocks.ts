import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { saleKeys } from "../constants/queryKeys";
import { productStockService } from "../services/productStockService";

const normalizeParams = (params?: ListParams | URLSearchParams) => {
  if (params instanceof URLSearchParams) {
    const normalized: Record<string, unknown> = {};
    params.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  return params;
};

export const useGetSaleProductStocks = (
  params?: ListParams | URLSearchParams,
  enabled = true,
) =>
  useQuery({
    queryKey: saleKeys.productStock.products(normalizeParams(params)),
    queryFn: () => productStockService.products(normalizeParams(params)),
    placeholderData: keepPreviousData,
    enabled,
  });
