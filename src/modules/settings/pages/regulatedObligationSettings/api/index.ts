import { $axiosPrivate } from "@/services/AxiosService";
import { endpoints } from "../constants/endpoints";
import type { RegulatedObligationSettingsQuery } from "./query";
import { buildRegulatedObligationSettingsQuery } from "./query";
import {
  normalizeRegulatedObligationSettingsResponse,
  type RegulatedObligationSettingsResponse,
} from "./normalize";
import type {
  RegulatedObligationSetting,
  RegulatedObligationSettingFormPayload,
} from "../types";

export const regulatedObligationSettingsService = {
  list: (filters?: RegulatedObligationSettingsQuery) =>
    $axiosPrivate
      .get<
        RegulatedObligationSettingsResponse
      >(endpoints.list, filters ? { params: buildRegulatedObligationSettingsQuery(filters) } : undefined)
      .then((response) =>
        normalizeRegulatedObligationSettingsResponse(response.data, {
          page: filters?.page ?? 1,
          pageSize: filters?.pageSize ?? 20,
        }),
      ),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<RegulatedObligationSetting>(endpoints.detail(id))
      .then((response) => response.data),
  create: (payload: RegulatedObligationSettingFormPayload) =>
    $axiosPrivate
      .post<number>(endpoints.create, payload)
      .then((response) => response.data),
  update: (
    id: string | number,
    payload: RegulatedObligationSettingFormPayload,
  ) => $axiosPrivate.put(endpoints.update(id), payload).then(() => undefined),
};
