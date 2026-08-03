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
      .post<FaDisposalResponse>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: FaDisposalPayload) =>
    $axiosPrivate
      .put<FaDisposalResponse>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaDisposalResponse>(endpoints.confirm(id))
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaDisposalResponse>(endpoints.cancel(id))
      .then((res) => res.data),
};
