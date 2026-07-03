import { useQuery } from "@tanstack/react-query";
import { cashOperationKeys } from "../constants/queryKeys";
import { cashOperationService } from "../services/cashOperationService";

export const useGetDetailCashOperation = (id?: string | number) =>
  useQuery({
    queryKey: cashOperationKeys.detail(id ?? ""),
    queryFn: () => cashOperationService.detail(id ?? ""),
    enabled: Boolean(id),
  });
