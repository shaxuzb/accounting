import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { departmentsService } from "../api";

export const useGetDetailDepartments = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => departmentsService.detail(id),
    enabled: Boolean(id),
  });
