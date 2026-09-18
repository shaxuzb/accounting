import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { downloadBlob } from "@/shared/utils/downloadBlob";
import { operationalReportKeys } from "../constants/queryKeys";
import type { OperationalReportKey } from "../constants/permissions";
import {
  operationalReportService,
  type ReportExportFormat,
} from "../services/operationalReportService";
import type { ReportPagedResponse } from "../types/type";

type QueryParams = URLSearchParams | Record<string, unknown>;

const serializeParams = (params?: QueryParams) =>
  params instanceof URLSearchParams
    ? params.toString()
    : JSON.stringify(params ?? {});

export const useOperationalReportList = <T>(
  report: OperationalReportKey,
  params?: QueryParams,
  enabled = true,
) =>
  useQuery<ReportPagedResponse<T>>({
    queryKey: operationalReportKeys.list(report, serializeParams(params)),
    queryFn: () => operationalReportService.list<T>(report, params),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useOperationalReportExport = (report: OperationalReportKey) => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (variables: {
      params?: QueryParams;
      format: ReportExportFormat;
    }) =>
      operationalReportService.export(
        report,
        variables.params,
        variables.format,
      ),
    onSuccess: (result) => {
      downloadBlob(result.blob, result.fileName);
      toast.success(t("reports.messages.exportReady"));
    },
    onError: () => {
      toast.error(t("reports.messages.exportFailed"));
    },
  });
};
