import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";

export const faDisposalService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
//any quyilgan to'g'irlash kerak
      .get<Paginated<any>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
//any quyilgan to'g'irlash kerak
      .get<any>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: Record<string, unknown>) =>
    $axiosPrivate
      .post<any>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: Record<string, unknown>) =>
    $axiosPrivate
//any quyilgan to'g'irlash kerak
      .put<any>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
//any quyilgan to'g'irlash kerak
      .put<any>(`${endpoints.detail(id)}/confirm`)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
//any quyilgan to'g'irlash kerak
      .put<any>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),
};

