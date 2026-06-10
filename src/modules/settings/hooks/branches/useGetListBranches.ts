import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { branchesService } from "../../services/branchesService";

export const useGetListBranches = (params?:URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.branches.list(params),
    queryFn: () => branchesService.list(params as any),
    placeholderData: keepPreviousData,
  });
