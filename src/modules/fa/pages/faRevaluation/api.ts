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
      .post<FaRevaluation>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: FaRevaluationPayload) =>
    $axiosPrivate
      .put<FaRevaluation>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaRevaluation>(endpoints.confirm(id))
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaRevaluation>(endpoints.cancel(id))
      .then((res) => res.data),
};

