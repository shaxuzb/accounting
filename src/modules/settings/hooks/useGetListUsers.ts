import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../constants/queryKeys";
import { usersService } from "../services/usersService";

export const useGetListUsers = (params?: ListParams) =>
  useQuery({
    queryKey: settingsKeys.users.list(params),
    queryFn: () => usersService.list(params),
    placeholderData: keepPreviousData,
  });
