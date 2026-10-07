import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { accountingPolicyEndpoints } from "../constants/endpoints";
import { accountingPolicyQueryKeys } from "../constants/queryKeys";
import type { PayrollTaxRegime } from "../types/type";

/** The payroll tax regimes the platform offers the organization. */
export const usePayrollTaxRegimes = () =>
  useQuery({
    queryKey: accountingPolicyQueryKeys.taxRegimes,
    queryFn: () =>
      $axiosPrivate
        .get<PayrollTaxRegime[]>(accountingPolicyEndpoints.taxRegimes)
        .then((response) => response.data),
    staleTime: 5 * 60 * 1000,
  });
