import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { normalizePaginated } from "../../shared/utils/normalize";
import { rentalAccrualEndpoints } from "./constants/endpoints";
import type {
  RentalAccrualDetail,
  RentalAccrualListItem,
  RentalAccrualUpdatePayload,
  RentalGenerateDuePayload,
  RentalGenerateDueResult,
} from "./types/type";

export const rentalAccrualApi = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<unknown>(rentalAccrualEndpoints.list, { params })
      .then((res): Paginated<RentalAccrualListItem> =>
        normalizePaginated<RentalAccrualListItem>(res.data),
      ),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<RentalAccrualDetail>(rentalAccrualEndpoints.detail(id))
      .then((res) => res.data),
  update: (id: string | number, payload: RentalAccrualUpdatePayload) =>
    $axiosPrivate
      .put<void>(rentalAccrualEndpoints.update(id), payload)
      .then(() => undefined),
  delete: (id: string | number) =>
    $axiosPrivate
      .delete<void>(rentalAccrualEndpoints.delete(id))
      .then(() => undefined),
  generateDue: (payload: RentalGenerateDuePayload) =>
    $axiosPrivate
      .post<RentalGenerateDueResult>(rentalAccrualEndpoints.generateDue, payload)
      .then((res) => res.data),
  post: (id: string | number) =>
    $axiosPrivate
      .put<void>(rentalAccrualEndpoints.post(id))
      .then(() => undefined),
  cancel: (id: string | number) =>
    $axiosPrivate
      .put<void>(rentalAccrualEndpoints.cancel(id))
      .then(() => undefined),
};
