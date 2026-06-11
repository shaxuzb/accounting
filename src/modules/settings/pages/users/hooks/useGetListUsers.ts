import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { queryKeys } from "../constants/queryKeys";
import { usersService } from "../api";

export const useGetListUsers = (params?: ListParams) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => usersService.list(params),
  });
