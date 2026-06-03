import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { authKeys } from "../constants/queryKeys";
import { authService } from "../services/authService";

export const useGetListAuth = (params?: ListParams) =>
  useQuery({
    queryKey: authKeys.auth.list(params),
    queryFn: () => authService.list(params),
    placeholderData: keepPreviousData,
  });
