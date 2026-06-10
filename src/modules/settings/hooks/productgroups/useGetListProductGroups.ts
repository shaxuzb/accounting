import { keepPreviousData, useQuery } from "@tanstack/react-query";
// import type { ListParams } from "@/shared/types";
import { settingsKeys } from "../../constants/queryKeys";
import { productGroupsService } from "../../services/productGroupsService";

export const useGetListProductGroups = (params?:URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.productGroups.list(params),
    queryFn: () => productGroupsService.list(params as any),
    placeholderData: keepPreviousData,
  });
