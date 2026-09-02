import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type {
  PaymentAcceptancePointCreatePayload,
  PaymentAcceptancePointUpdatePayload,
} from "./types/form";
import type { PaymentAcceptancePoint } from "./types/type";

export const paymentAcceptancePointService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PaymentAcceptancePoint>>(endpoints.list, { params })
      .then((response) => response.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PaymentAcceptancePoint>(endpoints.detail(id))
      .then((response) => response.data),
  create: (payload: PaymentAcceptancePointCreatePayload) =>
    $axiosPrivate
      .post<number>(endpoints.create, payload)
      .then((response) => response.data),
  update: (id: string | number, payload: PaymentAcceptancePointUpdatePayload) =>
    $axiosPrivate.put(endpoints.update(id), payload).then(() => undefined),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then(() => undefined),
};
