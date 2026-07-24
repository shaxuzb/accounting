import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";


export const useGetListPurchase = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: purchaseKeys.purchase.list(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => purchaseService.list(params),
    placeholderData: keepPreviousData,
  });
