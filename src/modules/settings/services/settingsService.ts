import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Settings, SettingsForm } from "../types/settings";

const endpoints = settingsEndpoints.settings;

export const settingsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Settings>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Settings>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: SettingsForm) =>
    $axiosPrivate.post<Settings>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<SettingsForm>) =>
    $axiosPrivate.put<Settings>(endpoints.update(id), payload).then((res) => res.data),
};
