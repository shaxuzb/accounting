import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartyService } from "../api";

export const useGetListCounterparty = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list( params?.toString?.() ?? params),
    queryFn: () => counterpartyService.list(params),
    // placeholderData: keepPreviousData,
  });





  
