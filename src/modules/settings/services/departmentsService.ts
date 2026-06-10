import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Departments } from "../types/settings";
import type { DepartmentsForm } from "../types/form";

const endpoints = settingsEndpoints.departments;

export const departmentsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Departments>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Departments>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: DepartmentsForm) =>
    $axiosPrivate.post<Departments>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<DepartmentsForm>) =>
    $axiosPrivate.put<Departments>(endpoints.update(id), payload).then((res) => res.data),
};
