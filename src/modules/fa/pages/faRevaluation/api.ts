import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaRevaluationFormValues } from "./types/form";
import type { FaRevaluation, FaRevaluationPayload } from "./types/type";

const transformPayload = (payload: FaRevaluationFormValues): FaRevaluationPayload => ({
  revaluationDate: payload.revaluationDate,
  reason: payload.reason || "",
  stateId: payload.stateId ?? 0,
  lines: payload.lines.map(line => ({
    faAssetId: Number(line.faAssetId),
    newValue: Number(line.newValue),
    note: line.note || "",
  }))
});

export const faRevaluationService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaRevaluation>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaRevaluation>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaRevaluationFormValues) =>
    $axiosPrivate
      .post<FaRevaluation>(endpoints.list, transformPayload(payload))
      .then((res) => res.data),

  update: (id: string | number, payload: FaRevaluationFormValues) =>
    $axiosPrivate
      .put<FaRevaluation>(endpoints.detail(id), transformPayload(payload))
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaRevaluation>(`${endpoints.detail(id)}/confirm`)
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaRevaluation>(`${endpoints.detail(id)}/cancel`)
      .then((res) => res.data),
};

