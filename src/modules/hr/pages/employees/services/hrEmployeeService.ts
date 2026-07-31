import { $axiosPrivate } from "@/services/AxiosService";
import { hrEmployeeEndpoints as endpoints } from "../constants/endpoints";
import type { HrWorkScheduleForm } from "../types/form";
import type {
  HrEmployeeCalendarDay,
  HrWorkSchedule,
} from "../types/type";

interface CalendarResponse {
  days?: HrEmployeeCalendarDay[];
}

interface WorkScheduleResponse {
  items?: HrWorkSchedule[];
}

export const hrEmployeeService = {
  workSchedules: (employeeId: string | number) =>
    $axiosPrivate
      .get<HrWorkSchedule[] | WorkScheduleResponse>(
        endpoints.workSchedules(employeeId),
      )
      .then((res) =>
        Array.isArray(res.data) ? res.data : res.data.items ?? [],
      ),
  createWorkSchedule: (
    employeeId: string | number,
    payload: HrWorkScheduleForm,
  ) =>
    $axiosPrivate
      .post<HrWorkSchedule>(endpoints.workSchedules(employeeId), payload)
      .then((res) => res.data),
  updateWorkSchedule: (
    employeeId: string | number,
    scheduleId: string | number,
    payload: HrWorkScheduleForm,
  ) =>
    $axiosPrivate
      .put<HrWorkSchedule>(
        endpoints.workSchedule(employeeId, scheduleId),
        payload,
      )
      .then((res) => res.data),
  deleteWorkSchedule: (
    employeeId: string | number,
    scheduleId: string | number,
  ) =>
    $axiosPrivate
      .delete(endpoints.workSchedule(employeeId, scheduleId))
      .then((res) => res.data),
  calendar: (
    employeeId: string | number,
    dateFrom: string,
    dateTo: string,
  ) =>
    $axiosPrivate
      .get<HrEmployeeCalendarDay[] | CalendarResponse>(
        endpoints.calendar(employeeId),
        { params: { dateFrom, dateTo } },
      )
      .then((res) => (Array.isArray(res.data) ? res.data : res.data.days ?? [])),
};
