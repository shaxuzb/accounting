import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaReceiptFormValues } from "./types/form";

export const faReceiptService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaReceiptFormValues>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaReceiptFormValues>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: Record<string, unknown>) =>
    $axiosPrivate.post<FaReceiptFormValues>(endpoints.list, payload).then((res) => res.data),

  update: (id: string | number, payload: Record<string, unknown>) =>
    $axiosPrivate
      .put<FaReceiptFormValues>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaReceiptFormValues>(`${endpoints.detail(id)}/confirm`)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaReceiptFormValues>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),

  remove: (id: string | number) =>
    $axiosPrivate.delete<FaReceiptFormValues>(endpoints.detail(id)).then((res) => res.data),
};

