import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FiscalCashRegisterForm } from "./types/form";
import type { FiscalCashRegister } from "./types/type";

export const fiscalCashRegisterService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<FiscalCashRegister>>(endpoints.list, { params })
      .then((response) => response.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<FiscalCashRegister>(endpoints.detail(id))
      .then((response) => response.data),
  create: (payload: FiscalCashRegisterForm) =>
    $axiosPrivate
      .post<FiscalCashRegister>(endpoints.create, payload)
      .then((response) => response.data),
  update: (id: string | number, payload: FiscalCashRegisterForm) =>
    $axiosPrivate
      .put<FiscalCashRegister>(endpoints.update(id), payload)
      .then((response) => response.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((response) => response.data),
};
