import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { productGroupsService } from "../../services/productGroupsService";

export const useGetDetailProductGroups = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.productGroups.detail(id),
    queryFn: () => productGroupsService.detail(id),
    enabled: Boolean(id),
  });
