import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { OrgBankAccounts } from "./types/type";
import type { OrgBankAccountsForm } from "./types/form";

export const orgBankAccountsService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<OrgBankAccounts>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<OrgBankAccounts>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: OrgBankAccountsForm) =>
    $axiosPrivate.post<OrgBankAccounts>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<OrgBankAccountsForm>) =>
    $axiosPrivate.put<OrgBankAccounts>(endpoints.update(id), payload).then((res) => res.data),
};
