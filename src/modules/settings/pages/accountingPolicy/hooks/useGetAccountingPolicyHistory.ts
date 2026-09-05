import { useQuery } from "@tanstack/react-query";
import { accountingPolicyService } from "../api";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";

export const useGetAccountingPolicyHistory = ({
  dateFrom,
  dateTo,
  enabled = true,
}: {
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
} = {}) =>
  useQuery({
    queryKey: accountingPolicyQueryKeys.history(dateFrom, dateTo),
    queryFn: () => accountingPolicyService.history(dateFrom, dateTo),
    enabled,
  });
