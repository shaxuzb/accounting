import { $axiosPrivate } from "@/services/AxiosService";
import { fileNameFromContentDisposition } from "@/shared/utils/downloadBlob";
import { operationalReportEndpoints } from "../constants/endpoints";
import type { OperationalReportKey } from "../constants/permissions";
import type { ReportPagedResponse } from "../types/type";

export type ReportExportFormat = "Excel" | "Pdf";

type QueryParams = URLSearchParams | Record<string, unknown>;

/**
 * Bo'sh qiymatlar so'rovga tushmasligi kerak: backend filterlarida ular
 * `null` emas, balki "bor" deb qabul qilinadi va natijani noto'g'ri qisadi.
 */
const cleanParams = (params?: QueryParams): Record<string, unknown> => {
  const source =
    params instanceof URLSearchParams
      ? Object.fromEntries(params)
      : (params ?? {});

  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
};

/**
 * Eksport endpointi ro'yxat servisini chaqirib, faqat **joriy sahifani**
 * faylga yozadi (ReportExportProfiles → result.Value.Items). Foydalanuvchi esa
 * filtr bo'yicha topilgan hamma satrni kutadi, shuning uchun eksportda
 * sahifalash ataylab kengaytiriladi.
 */
const EXPORT_PAGE_SIZE = 5000;

export const operationalReportService = {
  list: async <T>(report: OperationalReportKey, params?: QueryParams) => {
    const { data } = await $axiosPrivate.get<ReportPagedResponse<T>>(
      operationalReportEndpoints[report].list,
      { params: cleanParams(params) },
    );
    return data;
  },

  export: async (
    report: OperationalReportKey,
    params: QueryParams | undefined,
    format: ReportExportFormat,
  ) => {
    const response = await $axiosPrivate.get<Blob>(
      operationalReportEndpoints[report].export,
      {
        params: {
          ...cleanParams(params),
          page: 1,
          pageSize: EXPORT_PAGE_SIZE,
          format,
        },
        responseType: "blob",
      },
    );

    const fallback = `${report}.${format === "Pdf" ? "pdf" : "xlsx"}`;
    return {
      blob: response.data,
      fileName: fileNameFromContentDisposition(
        response.headers["content-disposition"],
        fallback,
      ),
    };
  },
};
