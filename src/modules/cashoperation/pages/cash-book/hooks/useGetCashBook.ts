import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { cashBookKeys } from "../constants/queryKeys";
import { cashBookService } from "../services/cashBookService";

export const useGetCashBook = (
  cashBoxId?: string | number,
  params?: QueryParams,
) =>
  useQuery({
    queryKey: cashBookKeys.detail(
      cashBoxId ?? "",
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => cashBookService.detail(cashBoxId ?? "", params),
    enabled: Boolean(cashBoxId),
  });
