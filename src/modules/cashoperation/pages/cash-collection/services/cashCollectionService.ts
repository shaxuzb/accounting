import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { cashCollectionEndpoints as endpoints } from "../constants/endpoints";
import type { CashCollectionRequest } from "../types/form";
import type {
  CashCollectionDocument,
  CashCollectionInTransit,
} from "../types/type";

const voidResponse = <T>(promise: Promise<{ data: T }>) =>
  promise.then(() => undefined);

export const cashCollectionService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<CashCollectionDocument>>(endpoints.list, { params })
      .then((response) => response.data),
  inTransit: (params?: QueryParams) =>
    $axiosPrivate
      .get<CashCollectionInTransit[]>(endpoints.inTransit, { params })
      .then((response) => response.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<CashCollectionDocument>(endpoints.detail(id))
      .then((response) => response.data),
  create: (payload: CashCollectionRequest) =>
    $axiosPrivate
      .post<number>(endpoints.create, payload)
      .then((response) => response.data),
  update: (id: string | number, payload: CashCollectionRequest) =>
    voidResponse($axiosPrivate.put(endpoints.update(id), payload)),
  remove: (id: string | number) =>
    voidResponse($axiosPrivate.delete(endpoints.delete(id))),
  sendToBank: (id: string | number) =>
    voidResponse($axiosPrivate.put(endpoints.sendToBank(id))),
  cancel: (id: string | number) =>
    voidResponse($axiosPrivate.put(endpoints.cancel(id))),
};
