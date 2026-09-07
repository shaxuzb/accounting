import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollPaymentEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollPaymentForm } from "../types/form";
import type { PayrollPayment } from "../types/type";

export const payrollPaymentService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollPayment>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollPayment>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: PayrollPaymentForm) =>
    $axiosPrivate
      .post<PayrollPayment | number>(endpoints.create, payload)
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate.put(endpoints.confirm(id)).then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate.put(endpoints.cancel(id)).then((res) => res.data),
};
