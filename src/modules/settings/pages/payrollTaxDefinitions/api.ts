import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollTaxDefinitionEndpoints as endpoints } from "./constants/endpoints";
import type { PayrollTaxDefinitionForm } from "./types/form";
import type { PayrollTaxDefinition } from "./types/type";

export const payrollTaxDefinitionService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollTaxDefinition>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollTaxDefinition>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: PayrollTaxDefinitionForm) =>
    $axiosPrivate
      .post<PayrollTaxDefinition>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: PayrollTaxDefinitionForm) =>
    $axiosPrivate
      .put<PayrollTaxDefinition>(endpoints.update(id), payload)
      .then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),
};
