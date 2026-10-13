import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollEmployeeEndpoints as endpoints } from "./constants/endpoints";
import type {
  PayrollEmployeeForm,
  PayrollEmployeeMainForm,
} from "./types/form";
import type { PayrollEmployee, PayrollEmployment } from "./types/type";

export const payrollEmployeeService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollEmployee>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollEmployee>(endpoints.detail(id))
      .then((res) => res.data),
  history: (id: string | number) =>
    $axiosPrivate.get<PayrollEmployment[]>(endpoints.history(id)).then((res) => res.data),
  create: (payload: PayrollEmployeeForm) =>
    $axiosPrivate
      .post<PayrollEmployee>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: PayrollEmployeeMainForm) =>
    $axiosPrivate
      .put<PayrollEmployee>(endpoints.update(id), payload)
      .then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),

};
