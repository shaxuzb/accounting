import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { roleService } from "../../services/roleService";

export const useGetListRole = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.role.list(params),
    queryFn: () => roleService.list(params),
    placeholderData: keepPreviousData,
  });
