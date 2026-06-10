import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { departmentsService } from "../../services/departmentsService";

export const useGetListDepartments = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.departments.list(params),
    queryFn: () => departmentsService.list(params as any),
    // placeholderData: keepPreviousData,
  });
