import { useQuery } from "@tanstack/react-query";
import { accountingPolicyService } from "../api";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";

export const useGetAccountingPolicyLookups = (enabled = false) => {
  const taxTypes = useQuery({
    queryKey: accountingPolicyQueryKeys.taxTypes,
    queryFn: accountingPolicyService.taxTypes,
    enabled,
  });
  const vatRates = useQuery({
    queryKey: accountingPolicyQueryKeys.vatRates,
    queryFn: accountingPolicyService.vatRates,
    enabled,
  });

  return { taxTypes, vatRates };
};
