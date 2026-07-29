import { useQuery } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";

export const useGetDetailPayrollTimesheet = (id?: string | number | null) =>
  useQuery({
    queryKey: payrollTimesheetKeys.detail(id ?? ""),
    queryFn: () => payrollTimesheetService.detail(id as string | number),
    enabled: Boolean(id),
  });
