import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { usersService } from "../api";

export const useGetDetailUsers = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => usersService.detail(id),
    enabled: Boolean(id),
  });
