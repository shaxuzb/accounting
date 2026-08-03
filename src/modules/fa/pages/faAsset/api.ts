import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type {
  FaAssetCreatePayload,
  FaAssetUpdatePayload,
} from "./types/form";
import type { FaAsset } from "./types/type";

export const faAssetService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaAsset>>(endpoints.list, { params })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaAsset>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaAssetCreatePayload) =>
    $axiosPrivate
      .post<FaAsset>(endpoints.list, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: FaAssetUpdatePayload) =>
    $axiosPrivate
      .put<FaAsset>(endpoints.detail(id), payload)
      .then((res) => res.data),

  confirm: (id: string | number) =>
    $axiosPrivate
      .put<FaAsset>(endpoints.confirm(id))
      .then((res) => res.data),

  cancel: (id: string | number) =>
    $axiosPrivate
      .put<FaAsset>(endpoints.cancel(id))
      .then((res) => res.data),
};
