import { $axiosPrivate } from "@/services/AxiosService";
import { edoEndpoints } from "./constants/endpoints";
import type {
  EdoActiveProviderRequestDto,
  EdoAuthChallengeDto,
  EdoAuthChallengeQuery,
  EdoAuthCompleteDto,
  EdoAuthCompleteRequestDto,
  EdoDocumentStatusDto,
  EdoDownloadedFile,
  EdoInboxListDto,
  EdoInboxQueryDto,
  EdoInboxRejectDto,
  EdoInboxRejectRequestDto,
  EdoOutboxCreateDto,
  EdoOutboxFacturaCreateRequestDto,
  EdoOutboxSignDto,
  EdoOutboxSignRequestDto,
  EdoProviderCode,
  EdoProviderDto,
} from "./types/type";

const getFileName = (disposition?: string) => {
  if (!disposition) return "edo-document";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] ?? "edo-document";
};

export const edoService = {
  activeProvider: () =>
    $axiosPrivate
      .get<EdoProviderDto>(edoEndpoints.activeProvider)
      .then((response) => response.data),

  setActiveProvider: (payload: EdoActiveProviderRequestDto) =>
    $axiosPrivate
      .put<EdoProviderDto>(edoEndpoints.activeProvider, payload)
      .then((response) => response.data),

  authChallenge: (params: EdoAuthChallengeQuery) =>
    $axiosPrivate
      .get<EdoAuthChallengeDto>(edoEndpoints.authChallenge, { params })
      .then((response) => response.data),

  authComplete: (
    providerCode: EdoProviderCode,
    payload: EdoAuthCompleteRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoAuthCompleteDto>(
        providerCode === "FAKTURA"
          ? edoEndpoints.fakturaAuthComplete
          : edoEndpoints.authComplete,
        payload,
      )
      .then((response) => response.data),

  createOutboxFactura: (payload: EdoOutboxFacturaCreateRequestDto) =>
    $axiosPrivate
      .post<EdoOutboxCreateDto>(edoEndpoints.outboxFacturas, payload)
      .then((response) => response.data),

  signOutbox: (
    id: string | number,
    payload: EdoOutboxSignRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoOutboxSignDto>(edoEndpoints.outboxSign(id), payload)
      .then((response) => response.data),

  inbox: (params: EdoInboxQueryDto) =>
    $axiosPrivate
      .get<EdoInboxListDto>(edoEndpoints.inbox, { params })
      .then((response) => response.data),

  rejectInbox: (
    id: string | number,
    payload: EdoInboxRejectRequestDto,
  ) =>
    $axiosPrivate
      .post<EdoInboxRejectDto>(edoEndpoints.inboxReject(id), payload)
      .then((response) => response.data),

  downloadFile: async (id: string | number): Promise<EdoDownloadedFile> => {
    try {
      const response = await $axiosPrivate.get<Blob>(edoEndpoints.file(id), {
        responseType: "blob",
        headers: { Accept: "application/octet-stream" },
      });
      return {
        blob: response.data,
        fileName: getFileName(response.headers["content-disposition"]),
        contentType: String(
          response.headers["content-type"] || "application/octet-stream",
        ),
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error &&
        "response" in error &&
        (error as { response?: { data?: unknown } }).response?.data instanceof Blob
      ) {
        const blob = (error as { response: { data: Blob } }).response.data;
        if (blob.type.includes("json")) {
          const problem = JSON.parse(await blob.text()) as { detail?: string };
          throw new Error(problem.detail ?? "EDO file download failed", {
            cause: error,
          });
        }
      }
      throw error;
    }
  },

  outboxStatus: (id: string | number) =>
    $axiosPrivate
      .get<EdoDocumentStatusDto>(edoEndpoints.outboxStatus(id))
      .then((response) => response.data),

  inboxStatus: (id: string | number) =>
    $axiosPrivate
      .get<EdoDocumentStatusDto>(edoEndpoints.inboxStatus(id))
      .then((response) => response.data),
};
