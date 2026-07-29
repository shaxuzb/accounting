import { $axiosPrivate } from "@/services/AxiosService";
import type {
  IntegrationCode,
  IntegrationConnectionRequest,
  IntegrationRecord,
  IntegrationService,
  IntegrationSignPayload,
} from "../types/type";

const endpoints = {
  list: "/settings/integrations",
  challenge: (code: IntegrationCode) =>
    `/settings/integrations/${code}/challenge`,
  connect: (code: IntegrationCode) => `/settings/integrations/${code}/connect`,
  disconnect: (code: IntegrationCode) => `/settings/integrations/${code}`,
};

export const apiIntegrationService: IntegrationService = {
  list: () =>
    $axiosPrivate
      .get<IntegrationRecord[]>(endpoints.list)
      .then((response) => response.data),

  challenge: (code) =>
    $axiosPrivate
      .post<IntegrationSignPayload>(endpoints.challenge(code))
      .then((response) => response.data),

  connect: (code, request: IntegrationConnectionRequest) =>
    $axiosPrivate
      .post<IntegrationRecord>(endpoints.connect(code), request)
      .then((response) => response.data),

  disconnect: (code) =>
    $axiosPrivate.delete(endpoints.disconnect(code)).then(() => undefined),
};
