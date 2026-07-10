import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaAssetFormValues } from "./types/form";
import type { FaAssetValues } from "./types/type";

export const faAssetService = {
  list: (searchParams?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FaAssetValues>>(endpoints.list, { params: searchParams })
      .then((res) => res.data),

  detail: (id: string | number) =>
    $axiosPrivate
      .get<FaAssetValues>(endpoints.detail(id))
      .then((res) => res.data),

  create: (payload: FaAssetFormValues) =>
    $axiosPrivate
      .post<FaAssetValues>(endpoints.list, payload as FaAssetFormValues)
      .then((res) => res.data),

  update: (id: string | number, payload: FaAssetFormValues) =>
    $axiosPrivate
      .put<FaAssetValues>(endpoints.detail(id), payload as FaAssetFormValues)
      .then((res) => res.data),

  remove: (id: string | number) =>
    $axiosPrivate.delete<FaAssetValues>(endpoints.detail(id)).then((res) => res.data),
};

