import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { retailSaleKeys } from "../constants/queryKeys";
import { retailSaleService } from "../services/retailSaleService";

export const useGetRetailSales = (
  params?: ListParams | URLSearchParams,
) =>
  useQuery({
    queryKey: retailSaleKeys.list(params),
    queryFn: () => retailSaleService.list(params),
    placeholderData: keepPreviousData,
  });
