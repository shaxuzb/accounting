import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { cashOperationKeys } from "../constants/queryKeys";
import { cashOperationService } from "../services/cashOperationService";

export const useGetCashOperations = (params?: QueryParams) =>
  useQuery({
    queryKey: cashOperationKeys.list(params),
    queryFn: () => cashOperationService.list(params),
  });
