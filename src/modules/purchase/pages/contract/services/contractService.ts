import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import type { Contract } from "../types/type";
import type { ContractForm } from "../types/form";
import { contractEndpoints } from "../constants/endpoints";

export const contractService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<Contract>>(contractEndpoints.contract.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<Contract>(contractEndpoints.contract.detail(id))
      .then((res) => res.data),
  create: (payload: ContractForm) =>
    $axiosPrivate
      .post<Contract>(contractEndpoints.contract.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: Partial<ContractForm>) =>
    $axiosPrivate
      .put<Contract>(contractEndpoints.contract.update(id), payload)
      .then((res) => res.data),
};



