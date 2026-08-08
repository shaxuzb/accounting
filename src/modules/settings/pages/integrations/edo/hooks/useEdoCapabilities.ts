import { useQuery } from "@tanstack/react-query";
import { edoService } from "../api";
import { edoQueryKeys } from "../constants/queryKeys";

export const useEdoCapabilities = (
  providerCode?: string,
  enabled = Boolean(providerCode),
) =>
  useQuery({
    queryKey: edoQueryKeys.capabilities(providerCode),
    queryFn: edoService.capabilities,
    enabled,
    staleTime: 60_000,
    retry: false,
  });
