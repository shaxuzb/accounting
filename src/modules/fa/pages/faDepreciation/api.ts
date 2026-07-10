import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaDepreciationRun } from "./types/type";

export const faDepreciationService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaDepreciationRun>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaDepreciationRun>(endpoints.detail(id))
      .then((res) => res.data),

  run: (payload: Record<string, unknown>) =>
    $axiosPrivate
      .post<FaDepreciationRun>(endpoints.list, payload)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaDepreciationRun>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),
};

