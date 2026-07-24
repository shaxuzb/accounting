import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

export const useGetListContract = (
  params?: QueryParams,
  contractTypeId?: number,
) => {
  const serializedParams =
    params instanceof URLSearchParams ? params.toString() : params;

  return useQuery({
    queryKey: [
      ...contractKeys.contract.list(serializedParams),
      contractTypeId,
    ],
    queryFn: () => contractService.list(params),
  });
};
