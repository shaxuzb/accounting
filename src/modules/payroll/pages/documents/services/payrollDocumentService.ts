import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { payrollDocumentEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollCalculateForm } from "../types/form";
import type { PayrollDocument } from "../types/type";

export const payrollDocumentService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PayrollDocument>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PayrollDocument>(endpoints.detail(id))
      .then((res) => res.data),
  calculate: (payload: PayrollCalculateForm) =>
    $axiosPrivate
      .post<PayrollDocument | number>(endpoints.calculate, payload)
      .then((res) => res.data),
  recalculate: (id: string | number) =>
    $axiosPrivate.post<number>(endpoints.recalculate(id)).then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate.put(endpoints.confirm(id)).then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate.put(endpoints.cancel(id)).then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),
};
