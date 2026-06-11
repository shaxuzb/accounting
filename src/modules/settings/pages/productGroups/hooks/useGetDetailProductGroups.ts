import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { productGroupsService } from "../api";

export const useGetDetailProductGroups = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => productGroupsService.detail(id),
    enabled: Boolean(id),
  });
