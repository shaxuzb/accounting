import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollTimesheetEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollTimesheetForm } from "../types/form";
import type {
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
  create: (payload: PayrollTimesheetForm) =>
    $axiosPrivate
      .post<PayrollTimesheet>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: PayrollTimesheetForm) =>
    $axiosPrivate
      .put<PayrollTimesheet>(endpoints.update(id), payload)
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate.put(endpoints.confirm(id)).then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate.put(endpoints.cancel(id)).then((res) => res.data),
  calendar: (periodId: number, employeeId: number) =>
    $axiosPrivate
      .get<PayrollTimesheetCalendar>(endpoints.calendar, {
        params: { periodId, employeeId },
      })
      .then((res) => res.data),
};
