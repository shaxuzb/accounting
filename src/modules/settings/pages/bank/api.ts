import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type {
  SettingsBank,
  SettingsBankCreate,
  SettingsBankDetail,
  SettingsBankUpdate,
} from "./types/type";

export const settingsBankService = {
  list: async (searchParams?: QueryParams) => {
    const { data } = await $axiosPrivate.get<Paginated<SettingsBank>>(
      endpoints.list,
      {
        params: searchParams,
      },
    );
    return data;
  },
  detail: async (id: string | number) => {
    const { data } = await $axiosPrivate.get<SettingsBankDetail>(
      endpoints.detail(id),
    );
    return data;
  },
  create: async (payload: SettingsBankCreate) => {
    const { data } = await $axiosPrivate.post<SettingsBank>(
      endpoints.create,
      payload,
    );
    return data;
  },
  update: async (id: string | number, payload: SettingsBankUpdate) => {
    const { data } = await $axiosPrivate.put<SettingsBank>(
      endpoints.update(id),
      payload,
    );
    return data;
  },
};
