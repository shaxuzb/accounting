import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

export const useGetListContract = (params?: QueryParams, contractType?: string) =>
  useQuery({
    queryKey: [...contractKeys.contract.list(params),contractType],
    queryFn: () => contractService.list(params),
    // placeholderData: keepPreviousData,
  });
