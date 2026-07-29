import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollPaymentKeys } from "../constants/queryKeys";
import { payrollPaymentService } from "../services/payrollPaymentService";

export const useGetPayrollPayments = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollPaymentKeys.list(params?.toString()),
    queryFn: () => payrollPaymentService.list(params),
    placeholderData: keepPreviousData,
  });
