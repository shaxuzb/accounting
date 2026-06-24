import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { purchaseEndpoints } from "../constants/endpoints";
import type {
  PurchaseData,
  PurchaseDetailData,
  PurchaseForm,
} from "../types/type";
import type { PurchaseCreatePayload } from "../types/form";

type QueryParams = ListParams | URLSearchParams;

const endpoints = purchaseEndpoints.purchase;

const normalizeParams = (params?: QueryParams) =>
  params instanceof URLSearchParams
    ? Object.fromEntries(params)
    : (params ?? {});

export const purchaseService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PurchaseData>>(endpoints.list, {
        params: {
          ...normalizeParams(params),
        },
      })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PurchaseDetailData>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: PurchaseCreatePayload) =>
    $axiosPrivate
      .post<PurchaseDetailData>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: Partial<PurchaseForm>) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.update(id), payload)
      .then((res) => res.data),
};
