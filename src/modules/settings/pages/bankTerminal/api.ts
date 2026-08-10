import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type {
  BankTerminalCreatePayload,
  BankTerminalForm,
} from "./types/form";
import type { BankTerminal } from "./types/type";

export const bankTerminalService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<BankTerminal>>(endpoints.list, { params })
      .then((response) => response.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<BankTerminal>(endpoints.detail(id))
      .then((response) => response.data),
  create: (payload: BankTerminalCreatePayload) =>
    $axiosPrivate
      .post<BankTerminal>(endpoints.create, payload)
      .then((response) => response.data),
  update: (id: string | number, payload: BankTerminalForm) =>
    $axiosPrivate
      .put<BankTerminal>(endpoints.update(id), payload)
      .then((response) => response.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((response) => response.data),
};
