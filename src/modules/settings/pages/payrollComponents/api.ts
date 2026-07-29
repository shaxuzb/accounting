import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollComponentEndpoints as endpoints } from "./constants/endpoints";
import type { PayrollComponentForm } from "./types/form";
import type { PayrollComponent } from "./types/type";

export const payrollComponentService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollComponent>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollComponent>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: PayrollComponentForm) =>
    $axiosPrivate
      .post<PayrollComponent>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: PayrollComponentForm) =>
    $axiosPrivate
      .put<PayrollComponent>(endpoints.update(id), payload)
      .then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),
};
