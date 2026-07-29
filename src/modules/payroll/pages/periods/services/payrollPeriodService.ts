import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollPeriodEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollPeriodForm } from "../types/form";
import type { PayrollPeriod } from "../types/type";

export const payrollPeriodService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollPeriod>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<PayrollPeriod>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: PayrollPeriodForm) =>
    $axiosPrivate
      .post<PayrollPeriod>(endpoints.create, payload)
      .then((res) => res.data),
  close: (id: string | number) =>
    $axiosPrivate.post(endpoints.close(id)).then((res) => res.data),
  reopen: (id: string | number) =>
    $axiosPrivate.post(endpoints.reopen(id)).then((res) => res.data),
};
