import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { saleEndpoints } from "../constants/endpoints";
import type {
  SaleDocConfirmForm,
  SaleDocCreateForm,
  SaleDocUpdateForm,
} from "../types/form";
import type { SaleDoc } from "../types/type";

type QueryParams = ListParams | URLSearchParams;

const endpoints = saleEndpoints.saleDoc;

export const saleDocService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<SaleDoc>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<SaleDoc>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: SaleDocCreateForm) =>
    $axiosPrivate
      .post<SaleDoc>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: SaleDocUpdateForm) =>
    $axiosPrivate
      .put<SaleDoc>(endpoints.update(id), payload)
      .then((res) => res.data),
  confirm: (id: string | number, payload: SaleDocConfirmForm) =>
    $axiosPrivate
      .put<SaleDoc>(endpoints.confirm(id), payload)
      .then((res) => res.data),
};
