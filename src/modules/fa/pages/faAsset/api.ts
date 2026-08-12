import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaAssetUpdatePayload } from "./types/form";
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

  update: (id: string | number, payload: FaAssetUpdatePayload) =>
    $axiosPrivate.put<void>(endpoints.detail(id), payload),

  remove: (id: string | number) =>
    $axiosPrivate.delete<void>(endpoints.detail(id)),
};
