import { useQuery } from "@tanstack/react-query";
import { roleService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailRole = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => roleService.detail(id),
    enabled: Boolean(id),
  });
