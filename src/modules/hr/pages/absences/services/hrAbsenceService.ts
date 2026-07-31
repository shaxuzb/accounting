import { $axiosPrivate } from "@/services/AxiosService";
import type { QueryParams } from "@/shared/types/api";
import { hrAbsenceEndpoints as endpoints } from "../constants/endpoints";
import type { HrAbsenceForm } from "../types/form";
import type { HrAbsence, HrAbsenceType } from "../types/type";

interface HrAbsenceListResponse {
  items?: HrAbsence[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  total?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

const appendFormValue = (
  formData: FormData,
  key: string,
  value: string | number | null,
) => {
  if (value !== null && value !== "") formData.append(key, String(value));
};

const toCreateFormData = (payload: HrAbsenceForm, files: File[]) => {
  const formData = new FormData();
  appendFormValue(formData, "employeeId", payload.employeeId);
  appendFormValue(formData, "absenceTypeId", payload.absenceTypeId);
  appendFormValue(formData, "startDate", payload.startDate);
  appendFormValue(formData, "endDate", payload.endDate);
  appendFormValue(formData, "note", payload.note);
  files.forEach((file) => formData.append("files", file));
  return formData;
};

export const hrAbsenceService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<HrAbsenceListResponse | HrAbsence[]>(endpoints.list, { params })
      .then((res) => {
        if (Array.isArray(res.data)) {
          return { items: res.data, total: res.data.length };
        }

        return {
          items: res.data.items ?? [],
          total: res.data.totalCount ?? res.data.total ?? 0,
          page: res.data.page,
          pageSize: res.data.pageSize,
        };
      }),
  types: () =>
    $axiosPrivate
      .get<HrAbsenceType[] | { items?: HrAbsenceType[] }>(endpoints.types)
      .then((res) =>
        Array.isArray(res.data) ? res.data : res.data.items ?? [],
      ),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<HrAbsence>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: HrAbsenceForm, files: File[]) =>
    $axiosPrivate
      .post<HrAbsence>(endpoints.list, toCreateFormData(payload, files))
      .then((res) => res.data),
  update: (id: string | number, payload: HrAbsenceForm) =>
    $axiosPrivate
      .put<HrAbsence>(endpoints.detail(id), payload)
      .then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete(endpoints.detail(id)).then((res) => res.data),
  addAttachments: (id: string | number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return $axiosPrivate
      .post(endpoints.attachments(id), formData)
      .then((res) => res.data);
  },
  downloadAttachment: (id: string | number, attachmentId: string | number) =>
    $axiosPrivate
      .get<Blob>(endpoints.attachment(id, attachmentId), {
        responseType: "blob",
      })
      .then((res) => res.data),
  deleteAttachment: (
    id: string | number,
    attachmentId: string | number,
  ) =>
    $axiosPrivate
      .delete(endpoints.attachment(id, attachmentId))
      .then((res) => res.data),
};
