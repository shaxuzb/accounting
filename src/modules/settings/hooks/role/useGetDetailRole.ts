import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../constants/queryKeys";
import { roleService } from "../services/roleService";

export const useGetDetailRole = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.role.detail(id),
    queryFn: () => roleService.detail(id),
    enabled: Boolean(id),
  });
