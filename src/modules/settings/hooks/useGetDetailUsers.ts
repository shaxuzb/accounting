import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../constants/queryKeys";
import { usersService } from "../services/usersService";

export const useGetDetailUsers = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.users.detail(id),
    queryFn: () => usersService.detail(id),
    enabled: Boolean(id),
  });
