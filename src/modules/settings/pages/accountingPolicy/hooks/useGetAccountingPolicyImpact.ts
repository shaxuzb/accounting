import { useQuery } from "@tanstack/react-query";
import { accountingPolicyService } from "../api";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";

export const useGetAccountingPolicyImpact = ({
  effectiveOn,
  documentType,
  enabled = true,
}: {
  effectiveOn: string;
  documentType?: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: accountingPolicyQueryKeys.impact(effectiveOn, documentType),
    queryFn: () => accountingPolicyService.impact(effectiveOn, documentType),
    enabled: enabled && Boolean(effectiveOn),
  });
