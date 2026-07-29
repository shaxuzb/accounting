import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollEmployeeEndpoints as endpoints } from "./constants/endpoints";
import type {
  PayrollEmployeeComponentForm,
  PayrollEmployeeForm,
  PayrollEmployeeMainForm,
  PayrollEmploymentForm,
} from "./types/form";
import type { PayrollEmployee } from "./types/type";

export const payrollEmployeeService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollEmployee>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollEmployee>(endpoints.detail(id))
      .then((res) => res.data),
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

  createEmployment: (id: string | number, payload: PayrollEmploymentForm) =>
    $axiosPrivate
      .post(endpoints.employments(id), payload)
      .then((res) => res.data),
  updateEmployment: (
    id: string | number,
    employmentId: string | number,
    payload: PayrollEmploymentForm,
  ) =>
    $axiosPrivate
      .put(endpoints.employment(id, employmentId), payload)
      .then((res) => res.data),

  assignComponent: (
    id: string | number,
    payload: PayrollEmployeeComponentForm,
  ) =>
    $axiosPrivate
      .post(endpoints.components(id), payload)
      .then((res) => res.data),
  removeComponent: (id: string | number, assignmentId: string | number) =>
    $axiosPrivate
      .delete(endpoints.component(id, assignmentId))
      .then((res) => res.data),
};
