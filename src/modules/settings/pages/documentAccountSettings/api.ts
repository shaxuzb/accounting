import { $axiosPrivate } from "@/services/AxiosService";
import { endpoints } from "./constants/endpoints";
import type {
  DocumentAccountSettingsDetail,
  DocumentAccountSettingsBatchPayload,
  DocumentAccountSettingsListResponse,
} from "./types/type";

export const documentAccountSettingsService = {
  list: () =>
    $axiosPrivate
      .get<DocumentAccountSettingsListResponse>(endpoints.list)
      .then((res) => res.data),
  detail: (documentTypeId: string | number) =>
    $axiosPrivate
      .get<DocumentAccountSettingsDetail>(endpoints.detail(documentTypeId))
      .then((res) => res.data),
  save: (payload: DocumentAccountSettingsBatchPayload) =>
    $axiosPrivate
      .post<DocumentAccountSettingsBatchPayload>(endpoints.save, payload)
      .then((res) => res.data),
};
