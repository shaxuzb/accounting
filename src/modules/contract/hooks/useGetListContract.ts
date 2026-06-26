import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

export const useGetListContract = (params?: ListParams | URLSearchParams,contractType?: string) =>
  useQuery({
    queryKey: [...contractKeys.contract.list(params),contractType],
    queryFn: () => contractService.list(params as any),
    // placeholderData: keepPreviousData,
  });
