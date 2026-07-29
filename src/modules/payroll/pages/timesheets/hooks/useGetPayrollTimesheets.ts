import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";

export const useGetPayrollTimesheets = (params?: URLSearchParams) =>
  useQuery({
    queryKey: payrollTimesheetKeys.list(params?.toString()),
    queryFn: () => payrollTimesheetService.list(params),
    placeholderData: keepPreviousData,
  });
