import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faAssetService } from "../api";

export const useGetDetailFaAsset = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => faAssetService.detail(id),
    enabled: Boolean(id),
  });
