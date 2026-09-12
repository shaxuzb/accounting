import { useQuery } from "@tanstack/react-query";
import { payrollPaymentKeys } from "../constants/queryKeys";
import { payrollPaymentService } from "../services/payrollPaymentService";

export const useGetPayrollAdvanceSuggestion = (periodId?: number | null) =>
  useQuery({
    queryKey: payrollPaymentKeys.advanceSuggestion(periodId ?? ""),
    queryFn: () => payrollPaymentService.advanceSuggestion(periodId as number),
    enabled: Boolean(periodId),
  });
