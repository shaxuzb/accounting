import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { departmentsService } from "../api";

export const useGetListDepartments = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => departmentsService.list(params),
    // placeholderData: keepPreviousData,
  });
