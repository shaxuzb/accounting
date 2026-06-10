import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Positions } from "../types/settings";
import type { PositionsForm } from "../types/form";

const endpoints = settingsEndpoints.positions;

export const positionsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Positions>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Positions>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: PositionsForm) =>
    $axiosPrivate.post<Positions>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<PositionsForm>) =>
    $axiosPrivate.put<Positions>(endpoints.update(id), payload).then((res) => res.data),
};
