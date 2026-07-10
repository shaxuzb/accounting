import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaRevaluationFormValues } from "./types/form";

export const faRevaluationService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaRevaluationFormValues>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaRevaluationFormValues>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: Record<string, unknown>) =>
    $axiosPrivate
      .post<FaRevaluationFormValues>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: Record<string, unknown>) =>
    $axiosPrivate
      .put<FaRevaluationFormValues>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaRevaluationFormValues>(`${endpoints.detail(id)}/confirm`)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaRevaluationFormValues>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),
};

