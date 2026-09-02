import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { paymentAcceptancePointOperationEndpoints as endpoints } from "../constants/endpoints";
import type { PaymentAcceptancePointOperationRequest } from "../types/form";
import type { PaymentAcceptancePointBalance, PaymentAcceptancePointOperation } from "../types/type";

const voidResponse = <T>(promise: Promise<{ data: T }>) => promise.then(() => undefined);

export const paymentAcceptancePointOperationService = {
  list: (params?: QueryParams) => $axiosPrivate.get<Paginated<PaymentAcceptancePointOperation>>(endpoints.list, { params }).then((response) => response.data),
  detail: (id: string | number) => $axiosPrivate.get<PaymentAcceptancePointOperation>(endpoints.detail(id)).then((response) => response.data),
  balance: (params?: QueryParams) => $axiosPrivate.get<PaymentAcceptancePointBalance>(endpoints.balance, { params }).then((response) => response.data),
  create: (payload: PaymentAcceptancePointOperationRequest) => $axiosPrivate.post<number>(endpoints.create, payload).then((response) => response.data),
  update: (id: string | number, payload: PaymentAcceptancePointOperationRequest) => voidResponse($axiosPrivate.put(endpoints.update(id), payload)),
  remove: (id: string | number) => voidResponse($axiosPrivate.delete(endpoints.delete(id))),
  confirm: (id: string | number) => voidResponse($axiosPrivate.post(endpoints.confirm(id))),
  cancel: (id: string | number) => voidResponse($axiosPrivate.post(endpoints.cancel(id))),
};
