import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { branchesService } from "../../services/branchesService";

export const useGetDetailBranches = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.branches.detail(id),
    queryFn: () => branchesService.detail(id),
    enabled: Boolean(id),
  });
