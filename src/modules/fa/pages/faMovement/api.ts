import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaMovement, FaMovementPayload } from "./types/type";

export const faMovementService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaMovement>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaMovement>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaMovementPayload) =>
    $axiosPrivate.post<number>(endpoints.list, payload).then((res) => res.data),

  update: (id: string | number, payload: FaMovementPayload) =>
    $axiosPrivate.put<void>(endpoints.detail(id), payload),

  confirm: (id: string | number) =>
    $axiosPrivate.put<void>(endpoints.confirm(id)),

  cancel: (id: string | number) =>
    $axiosPrivate.put<void>(endpoints.cancel(id)),
};
