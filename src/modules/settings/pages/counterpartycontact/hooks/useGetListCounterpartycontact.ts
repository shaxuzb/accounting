import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { counterpartycontactService } from "../api";

export const useGetListCounterpartycontact = (params?:URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => counterpartycontactService.list(params as any),
    placeholderData: keepPreviousData,
  });
