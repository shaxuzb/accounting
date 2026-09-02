import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { documentEndpoints } from "./constants/endpoints";
import type { DocumentRegistryItem } from "./types/type";

export const documentService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<DocumentRegistryItem>>(documentEndpoints.list, { params })
      .then((response) => response.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<DocumentRegistryItem>(documentEndpoints.detail(id))
      .then((response) => response.data),
};
