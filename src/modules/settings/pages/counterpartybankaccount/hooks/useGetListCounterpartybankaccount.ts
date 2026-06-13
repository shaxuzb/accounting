import { useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { counterpartybankaccountService } from "../api";

export const useGetListCounterpartybankaccount = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => counterpartybankaccountService.list(params),
    // placeholderData: keepPreviousData,
  });
