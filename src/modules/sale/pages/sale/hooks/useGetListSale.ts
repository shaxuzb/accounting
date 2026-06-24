import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";

export const useGetListSale = (
  params?: ListParams | URLSearchParams,
) =>
  useQuery({
    queryKey: saleKeys.saleDoc.list(params),
    queryFn: () => saleDocService.list(params),
    placeholderData: keepPreviousData,
  });
