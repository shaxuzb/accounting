import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { normalizePaginated } from "../../shared/utils/normalize";
import { rentalContractEndpoints } from "./constants/endpoints";
import type {
  RentalContractDetail,
  RentalContractListItem,
} from "./types/type";

const getId = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Number(record.id ?? record.data ?? record.result);
  }
  return 0;
};

export const rentalContractApi = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<unknown>(rentalContractEndpoints.list, { params })
      .then(
        (res): Paginated<RentalContractListItem> =>
          normalizePaginated<RentalContractListItem>(res.data),
      ),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<RentalContractDetail>(rentalContractEndpoints.detail(id))
      .then((res) => res.data),
  create: (payload: object) =>
    $axiosPrivate
      .post<unknown>(rentalContractEndpoints.create, payload)
      .then((res) => getId(res.data)),
  update: (id: string | number, payload: object) =>
    $axiosPrivate
      .put<void>(rentalContractEndpoints.update(id), payload)
      .then(() => undefined),
  delete: (id: string | number) =>
    $axiosPrivate
      .delete<void>(rentalContractEndpoints.delete(id))
      .then(() => undefined),
  activate: (id: string | number) =>
    $axiosPrivate
      .put<void>(rentalContractEndpoints.activate(id))
      .then(() => undefined),
  cancel: (id: string | number) =>
    $axiosPrivate
      .put<void>(rentalContractEndpoints.cancel(id))
      .then(() => undefined),
};
