import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { OrgBankAccounts } from "../types/settings";
import type { OrgBankAccountsForm } from "../types/form";

const endpoints = settingsEndpoints.orgBankAccounts;

export const orgBankAccountsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<OrgBankAccounts>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<OrgBankAccounts>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: OrgBankAccountsForm) =>
    $axiosPrivate.post<OrgBankAccounts>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<OrgBankAccountsForm>) =>
    $axiosPrivate.put<OrgBankAccounts>(endpoints.update(id), payload).then((res) => res.data),
};
