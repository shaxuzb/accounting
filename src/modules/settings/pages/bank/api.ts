import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { endpoints } from "./constants/endpoints";
import type { DirectoryBank, SettingsBank } from "./types/type";

export const settingsBankService = {
  mine: async (search?: string) => {
    const { data } = await $axiosPrivate.get<SettingsBank[]>(endpoints.mine, {
      params: { search: search || undefined },
    });
    return data;
  },
  directory: async (search?: string) => {
    const { data } = await $axiosPrivate.get<Paginated<DirectoryBank>>(
      endpoints.directory,
      { params: { search: search || undefined, stateId: 1, pageSize: 500 } },
    );
    return data;
  },
  attach: async (bankIds: number[]) => {
    await $axiosPrivate.post(endpoints.mine, { bankIds });
  },
  detach: async (bankId: number) => {
    await $axiosPrivate.delete(endpoints.detach(bankId));
  },
};
