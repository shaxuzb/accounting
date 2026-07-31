import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrEmployeeKeys } from "../constants/queryKeys";
import { hrEmployeeService } from "../services/hrEmployeeService";
import type { HrWorkScheduleForm } from "../types/form";

export const useHrWorkSchedules = (employeeId: string | number) =>
  useQuery({
    queryKey: hrEmployeeKeys.workSchedules(employeeId),
    queryFn: () => hrEmployeeService.workSchedules(employeeId),
    enabled: Boolean(employeeId),
  });

export const useSaveHrWorkSchedule = (employeeId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      payload,
    }: {
      scheduleId?: number | null;
      payload: HrWorkScheduleForm;
    }) =>
      scheduleId
        ? hrEmployeeService.updateWorkSchedule(
            employeeId,
            scheduleId,
            payload,
          )
        : hrEmployeeService.createWorkSchedule(employeeId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: hrEmployeeKeys.workSchedules(employeeId),
      }),
  });
};

export const useDeleteHrWorkSchedule = (employeeId: string | number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: number) =>
      hrEmployeeService.deleteWorkSchedule(employeeId, scheduleId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: hrEmployeeKeys.workSchedules(employeeId),
      }),
  });
};

export const useHrEmployeeCalendar = (
  employeeId: string | number,
  dateFrom: string,
  dateTo: string,
) =>
  useQuery({
    queryKey: hrEmployeeKeys.calendar(employeeId, dateFrom, dateTo),
    queryFn: () => hrEmployeeService.calendar(employeeId, dateFrom, dateTo),
    enabled: Boolean(employeeId && dateFrom && dateTo),
  });
