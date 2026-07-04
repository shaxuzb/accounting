import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { cashBookKeys } from "../constants/queryKeys";
import { cashBookService } from "../services/cashBookService";

export const useGetCashBookCashBoxes = (params?: QueryParams) =>
  useQuery({
    queryKey: cashBookKeys.cashBoxes(params instanceof URLSearchParams ? params.toString() : params),
    queryFn: () => cashBookService.cashBoxes(params),
    placeholderData: keepPreviousData,
  });
