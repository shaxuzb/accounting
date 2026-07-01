import type { QueryParams } from "@/shared/types/api";
import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { postingTemplateViewsEndpoints } from "../constants/endpoints";
import type { PostingTemplateView } from "../types/type";

export const postingTemplateViewsService = {
  list: async (params?: QueryParams) => {
    const { data } = await $axiosPrivate.get<
      Paginated<PostingTemplateView> | PostingTemplateView[]
    >(postingTemplateViewsEndpoints.list, { params });

    return Array.isArray(data) ? data : data?.items ?? [];
  },
  detail: async (id: string | number) => {
    const { data } = await $axiosPrivate.get<PostingTemplateView>(
      postingTemplateViewsEndpoints.detail(id),
    );
    return data;
  },
};
