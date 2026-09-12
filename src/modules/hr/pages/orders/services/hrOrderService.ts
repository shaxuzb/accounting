import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { hrOrderEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollHrOrderForm } from "../types/form";
import type { PayrollHrOrder, PayrollHrOrderListItem, PayrollHrOrderPrint } from "../types/type";

export const hrOrderService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<PayrollHrOrderListItem>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<PayrollHrOrder>(endpoints.detail(id)).then((res) => res.data),
  print: (id: string | number) =>
    $axiosPrivate.get<PayrollHrOrderPrint>(endpoints.print(id)).then((res) => res.data),
  create: (payload: PayrollHrOrderForm) =>
    $axiosPrivate.post<PayrollHrOrder | number>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: PayrollHrOrderForm) =>
    $axiosPrivate.put(endpoints.update(id), payload).then((res) => res.data),
  confirm: (id: string | number) => $axiosPrivate.post(endpoints.confirm(id)).then((res) => res.data),
  cancel: (id: string | number) => $axiosPrivate.post(endpoints.cancel(id)).then((res) => res.data),
  delete: (id: string | number) => $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),
};
