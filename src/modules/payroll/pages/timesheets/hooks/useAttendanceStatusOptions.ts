import { useQuery } from "@tanstack/react-query";
import { payrollTimesheetKeys } from "../constants/queryKeys";
import { payrollTimesheetService } from "../services/payrollTimesheetService";

export const useAttendanceStatusOptions = () =>
  useQuery({
    queryKey: payrollTimesheetKeys.attendanceStatusOptions(),
    queryFn: payrollTimesheetService.attendanceStatusOptions,
    staleTime: 5 * 60 * 1000,
  });
