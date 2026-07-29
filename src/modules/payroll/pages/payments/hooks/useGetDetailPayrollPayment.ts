import { useQuery } from "@tanstack/react-query";
import { payrollPaymentKeys } from "../constants/queryKeys";
import { payrollPaymentService } from "../services/payrollPaymentService";

export const useGetDetailPayrollPayment = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollPaymentKeys.detail(id ?? ""),
    queryFn: () => payrollPaymentService.detail(id as string | number),
    enabled: Boolean(id),
  });
