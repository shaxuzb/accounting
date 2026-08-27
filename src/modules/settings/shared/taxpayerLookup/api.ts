import { $axiosPrivate } from "@/services/AxiosService";
import type { DictionaryItem, TaxpayerLookupDto } from "./types";

export const taxpayerLookupService = {
  lookup: async (companyInn: string) => {
    const { data } = await $axiosPrivate.get<TaxpayerLookupDto>(
      "/organizations/by-inn",
      { params: { companyInn } },
    );
    return data;
  },
};

export const taxpayerDictionaryService = {
  regions: async () => {
    const { data } = await $axiosPrivate.get<DictionaryItem[]>(
      "manuals/regions",
    );
    return data;
  },
  districts: async (regionId: number) => {
    const { data } = await $axiosPrivate.get<DictionaryItem[]>(
      "manuals/districts",
      { params: { regionId } },
    );
    return data;
  },
};
