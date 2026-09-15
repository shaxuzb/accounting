import { useQuery } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { contractKeys } from "../constants/queryKeys";
import { contractResponsiblePersonService } from "../services/contractService";

export const useGetListContractResponsiblePersons = (params?: QueryParams) => {
  const serializedParams =
    params instanceof URLSearchParams ? params.toString() : params;

  return useQuery({
    queryKey: contractKeys.responsiblePerson.list(serializedParams),
    queryFn: () => contractResponsiblePersonService.list(params),
  });
};
