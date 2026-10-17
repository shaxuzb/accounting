import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { cashBookKeys } from "../constants/queryKeys";
import { cashBookService } from "../services/cashBookService";

export const useGetCashBookSheets = (
  cashBoxId?: string | number,
  params?: QueryParams,
) =>
  useQuery({
    queryKey: cashBookKeys.sheets(
      cashBoxId ?? "",
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => cashBookService.sheets(cashBoxId ?? "", params),
    enabled: Boolean(cashBoxId),
  });
