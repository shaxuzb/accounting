import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaMovement } from "./types/type";

export const faMovementService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaMovement>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaMovement>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: Record<string, unknown>) =>
    $axiosPrivate.post<FaMovement>(endpoints.list, payload).then((res) => res.data),

  update: (id: string | number, payload: Record<string, unknown>) =>
    $axiosPrivate
      .put<FaMovement>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaMovement>(`${endpoints.detail(id)}/confirm`)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaMovement>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),
};

