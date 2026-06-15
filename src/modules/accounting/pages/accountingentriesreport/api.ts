import { $axiosPrivate } from "@/services/AxiosService";
import { accountingEntriesReportEndpoints } from "./constants/endpoints";
import type { AccountingEntriesReportQueryParams } from "./types/type";
import { normalizeAccountingEntriesReport } from "./utils/normalize";

export const accountingEntriesReportService = {
  postings: async ({
    documentId,
    documentTypeId = 1,
  }: AccountingEntriesReportQueryParams) => {
    const { data } = await $axiosPrivate.get(accountingEntriesReportEndpoints.postings, {
      params: { documentTypeId, documentId },
    });
    return normalizeAccountingEntriesReport(data);
  },
};
