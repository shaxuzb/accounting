import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { branchesService } from "../api";

export const useGetDetailBranches = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => branchesService.detail(id),
    enabled: Boolean(id),
  });
