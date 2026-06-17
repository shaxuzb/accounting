import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

export const useGetListContract = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: contractKeys.contract.list(params),
    queryFn: () => contractService.list(params as any),
    // placeholderData: keepPreviousData,
  });
