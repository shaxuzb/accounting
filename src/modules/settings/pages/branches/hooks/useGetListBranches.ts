import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { branchesService } from "../api";

export const useGetListBranches = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString?.() ?? params),
    queryFn: () => branchesService.list(params),
    placeholderData: keepPreviousData,
  });
