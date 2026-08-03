import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaReceiptPayload, FaReceiptResponse } from "./types/type";

export const faReceiptService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaReceiptResponse>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaReceiptResponse>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaReceiptPayload) =>
    $axiosPrivate
      .post<FaReceiptResponse>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: FaReceiptPayload) =>
    $axiosPrivate
      .put<FaReceiptResponse>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaReceiptResponse>(endpoints.confirm(id))
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaReceiptResponse>(endpoints.cancel(id))
      .then((res) => res.data),
};
