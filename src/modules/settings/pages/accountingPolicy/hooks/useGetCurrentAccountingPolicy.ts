import { useQuery } from "@tanstack/react-query";
import { accountingPolicyService } from "../api";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";

export const useGetCurrentAccountingPolicy = ({
  effectiveOn,
  enabled = true,
}: { effectiveOn?: string; enabled?: boolean } = {}) =>
  useQuery({
    queryKey: accountingPolicyQueryKeys.current(effectiveOn),
    queryFn: () => accountingPolicyService.current(effectiveOn),
    enabled,
  });
