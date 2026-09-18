import type { OperationalReportKey } from "./permissions";

export const operationalReportKeys = {
  all: ["operational-report"] as const,
  list: (report: OperationalReportKey, params?: unknown) =>
    [...operationalReportKeys.all, report, "list", params] as const,
};
