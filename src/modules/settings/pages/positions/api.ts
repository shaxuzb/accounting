import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { Positions } from "./types/type";
import type { PositionsForm } from "./types/form";

export const positionsService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<Positions>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Positions>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: PositionsForm) =>
    $axiosPrivate.post<Positions>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<PositionsForm>) =>
    $axiosPrivate.put<Positions>(endpoints.update(id), payload).then((res) => res.data),
};
