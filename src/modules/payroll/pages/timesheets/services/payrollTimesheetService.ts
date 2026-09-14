import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollTimesheetEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollTimesheetForm } from "../types/form";
import { toTimesheetSavePayload } from "../utils/timesheet";
import type {
  PayrollAttendanceStatusOption,
  PayrollTimesheet,
  PayrollTimesheetCalendar,
} from "../types/type";

export const payrollTimesheetService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollTimesheet>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollTimesheet>(endpoints.detail(id))
      .then((res) => res.data),
  detailCalendar: (id: string | number) =>
    $axiosPrivate
      .get<PayrollTimesheetCalendar>(endpoints.detailCalendar(id))
      .then((res) => res.data),
  create: (payload: PayrollTimesheetForm) =>
    $axiosPrivate
      .post<PayrollTimesheet>(endpoints.create, toTimesheetSavePayload(payload))
      .then((res) => res.data),
  update: (id: string | number, payload: PayrollTimesheetForm) =>
    $axiosPrivate
      .put<PayrollTimesheet>(endpoints.update(id), toTimesheetSavePayload(payload))
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate.put(endpoints.confirm(id)).then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate.put(endpoints.cancel(id)).then((res) => res.data),
  calendar: (periodId: number, employeeId: number) =>
    $axiosPrivate
      .get<PayrollTimesheetCalendar>(endpoints.employeeCalendar, {
        params: { periodId, employeeId },
      })
      .then((res) => res.data),
  calendarTable: (periodId: number) =>
    $axiosPrivate
      .get<PayrollTimesheetCalendar>(endpoints.calendarTable, {
        params: { periodId },
      })
      .then((res) => res.data),
  attendanceStatusOptions: () =>
    $axiosPrivate
      .get<PayrollAttendanceStatusOption[]>(endpoints.attendanceStatusOptions)
      .then((res) => res.data),
  initializeDays: (id: string | number) =>
    $axiosPrivate.post(endpoints.initializeDays(id)).then((res) => res.data),
};
