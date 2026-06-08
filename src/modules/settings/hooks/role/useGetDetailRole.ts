import { useQuery } from "@tanstack/react-query";
import { roleService } from "../../services/roleService";
import { settingsKeys } from "../../constants/queryKeys";

export const useGetDetailRole = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.role.detail(id),
    queryFn: () => roleService.detail(id),
    enabled: Boolean(id),
  });
