import { useQuery } from "@tanstack/react-query";
import { payrollPeriodKeys } from "../constants/queryKeys";
import { payrollPeriodService } from "../services/payrollPeriodService";

export const useGetDetailPayrollPeriod = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollPeriodKeys.detail(id ?? ""),
    queryFn: () => payrollPeriodService.detail(id as string | number),
    enabled: Boolean(id),
  });
