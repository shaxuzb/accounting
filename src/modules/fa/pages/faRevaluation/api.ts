import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaRevaluation, FaRevaluationPayload } from "./types/type";

export const faRevaluationService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaRevaluation>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaRevaluation>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaRevaluationPayload) =>
    $axiosPrivate
      .post<number>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: FaRevaluationPayload) =>
    $axiosPrivate
      .put<void>(endpoints.detail(id), payload),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<void>(endpoints.confirm(id)),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<void>(endpoints.cancel(id)),
};

