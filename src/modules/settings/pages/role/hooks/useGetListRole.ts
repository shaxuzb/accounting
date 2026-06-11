import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { roleService } from "../api";

export const useGetListRole = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => roleService.list(params),
    placeholderData: keepPreviousData,
  });
