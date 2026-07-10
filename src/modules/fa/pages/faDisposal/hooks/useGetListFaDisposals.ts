import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faDisposalService } from "../api";

export const useGetListFaDisposals = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => faDisposalService.list(params),
    placeholderData: keepPreviousData,
  });
