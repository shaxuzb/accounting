import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import type { FaDisposal } from "@/modules/fa/types/fa";
import { endpoints } from "./constants/endpoints";

export const faDisposalService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaDisposal>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaDisposal>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: Record<string, unknown>) =>
    $axiosPrivate
      .post<FaDisposal>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: Record<string, unknown>) =>
    $axiosPrivate
      .put<FaDisposal>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaDisposal>(`${endpoints.detail(id)}/confirm`)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaDisposal>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),
};

