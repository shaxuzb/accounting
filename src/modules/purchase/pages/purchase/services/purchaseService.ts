import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { purchaseEndpoints } from "../constants/endpoints";
import type {
  PurchaseData,
  PurchaseDetailData,
  PurchaseForm,
} from "../types/type";
import type {
  PurchaseCreatePayload,
  PurchaseUpdatePayload,
} from "../types/form";

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
  update: (
    id: string | number,
    payload: PurchaseUpdatePayload | Partial<PurchaseForm>,
  ) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.update(id), payload)
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.confirm(id))
      .then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate
      .put<PurchaseDetailData>(endpoints.cancel(id))
      .then((res) => res.data),
};
