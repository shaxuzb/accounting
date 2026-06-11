import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { Departments } from "./types/type";
import type { DepartmentsForm } from "./types/form";

export const departmentsService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<Departments>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Departments>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: DepartmentsForm) =>
    $axiosPrivate.post<Departments>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<DepartmentsForm>) =>
    $axiosPrivate.put<Departments>(endpoints.update(id), payload).then((res) => res.data),
};
