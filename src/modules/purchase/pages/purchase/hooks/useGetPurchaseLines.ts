import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { purchaseKeys } from "../constants/queryKeys";
import { purchaseService } from "../services/purchaseService";

export const useGetPurchaseLines = (
  params?: ListParams | URLSearchParams,
  enabled = true,
) =>
  useQuery({
    queryKey: purchaseKeys.purchase.lines(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => purchaseService.lines(params),
    placeholderData: keepPreviousData,
    enabled,
  });
