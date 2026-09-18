import { Button, Dropdown } from "antd";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useOperationalReportExport } from "../hooks";
import type { OperationalReportKey } from "../constants/permissions";

interface ReportExportButtonProps {
  report: OperationalReportKey;
  permission: string;
  params?: URLSearchParams | Record<string, unknown>;
  disabled?: boolean;
}

/**
 * Backend ikkala formatni ham beradi (ReportExporter: ClosedXML va PDFsharp),
 * format so'rovga `format=Excel|Pdf` bo'lib ketadi.
 */
export default function ReportExportButton({
  report,
  permission,
  params,
  disabled = false,
}: ReportExportButtonProps) {
  const { t } = useTranslation();
  const exportMutation = useOperationalReportExport(report);

  return (
    <PermissionCard permission={permission}>
      <Dropdown
        disabled={disabled || exportMutation.isPending}
        menu={{
          items: [
            { key: "Excel", label: t("reports.actions.exportExcel") },
            { key: "Pdf", label: t("reports.actions.exportPdf") },
          ],
          onClick: ({ key }) =>
            exportMutation.mutate({
              params,
              format: key === "Pdf" ? "Pdf" : "Excel",
            }),
        }}
      >
        <Button
          icon={<Download className="size-4" />}
          loading={exportMutation.isPending}
        >
          {t("reports.actions.export")}
        </Button>
      </Dropdown>
    </PermissionCard>
  );
}
