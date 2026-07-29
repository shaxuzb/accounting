import { useQuery } from "@tanstack/react-query";
import { payrollReportKeys } from "../constants/queryKeys";
import { payrollReportService } from "../services/payrollReportService";

export const useGetPayrollRegister = (periodId?: number | null) =>
  useQuery({
    queryKey: payrollReportKeys.register(periodId),
    queryFn: () => payrollReportService.register(periodId as number),
    enabled: Boolean(periodId),
  });
