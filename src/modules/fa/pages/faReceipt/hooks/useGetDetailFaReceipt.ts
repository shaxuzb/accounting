import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faReceiptService } from "../api";

export const useGetDetailFaReceipt = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => faReceiptService.detail(id),
    enabled: Boolean(id),
  });
