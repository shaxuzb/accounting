import { useQuery } from "@tanstack/react-query";
import { payrollReportKeys } from "../constants/queryKeys";
import { payrollReportService } from "../services/payrollReportService";

export const useGetPayrollPayslip = (
  periodId?: number | null,
  employeeId?: number | null,
) =>
  useQuery({
    queryKey: payrollReportKeys.payslip(periodId, employeeId),
    queryFn: () =>
      payrollReportService.payslip(periodId as number, employeeId as number),
    enabled: Boolean(periodId && employeeId),
  });
