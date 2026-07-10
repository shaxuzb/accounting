import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

export const useGetListFaReceipts = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => faReceiptService.list(params),
    placeholderData: keepPreviousData,
  });
