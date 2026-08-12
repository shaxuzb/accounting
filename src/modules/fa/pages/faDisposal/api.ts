import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaDisposalPayload, FaDisposalResponse } from "./types/type";

export const faDisposalService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaDisposalResponse>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaDisposalResponse>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaDisposalPayload) =>
    $axiosPrivate
      .post<number>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: FaDisposalPayload) =>
    $axiosPrivate.put<void>(endpoints.detail(id), payload),

  confirm: (id: string | number) =>
    $axiosPrivate.put<void>(endpoints.confirm(id)),

  cancel: (id: string | number) =>
    $axiosPrivate.put<void>(endpoints.cancel(id)),
};
