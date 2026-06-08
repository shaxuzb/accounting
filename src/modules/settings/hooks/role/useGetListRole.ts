import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { roleService } from "../../services/roleService";

export const useGetListRole = (params?: ListParams) =>
  useQuery({
    queryKey: settingsKeys.role.list(params),
    queryFn: () => roleService.list(params),
    placeholderData: keepPreviousData,
  });
