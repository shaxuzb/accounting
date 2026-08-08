import { Alert, Button, Skeleton, Tooltip } from "antd";
// import { Descriptions } from "antd";
import {
  Ban,
  Download,
  FilePlus2,
  FileSignature,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EdoDocumentDto } from "../types/type";
import { useEdoDocumentDetail, useEdoFilePreview } from "../hooks";
// import EdoDocumentStatusPanel from "./EdoDocumentStatusPanel";

interface EdoInboxDocumentPreviewProps {
  document: EdoDocumentDto;
  canDownload: boolean;
  canReject: boolean;
  canGetDetail?: boolean;
  direction?: "INBOX" | "OUTBOX";
  onDownload: (document: EdoDocumentDto) => void;
  onReject: () => void;
}

export default function EdoInboxDocumentPreview({
  document,
  canDownload,
  canReject,
  canGetDetail = false,
  direction = "INBOX",
  onDownload,
  onReject,
}: EdoInboxDocumentPreviewProps) {
  const { t } = useTranslation();
  const fileQuery = useEdoFilePreview(document.id);
  const detailQuery = useEdoDocumentDetail(document.id, canGetDetail);
  const resolvedDocument = detailQuery.data ?? document;

  const printPreview = () => {
    if (!fileQuery.previewUrl) return;
    const printWindow = window.open(
      fileQuery.previewUrl,
      "_blank",
      "noopener,noreferrer",
    );
    printWindow?.addEventListener("load", () => printWindow.print(), {
      once: true,
    });
  };

  const unavailableTitle = t(
    "settings.integrations.edo.navigation.notAvailable",
  );

  return (
    <div
      data-direction={direction}
      className="space-y-3 rounded-xl border border-border bg-surface-muted/35 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-2 shadow-sm">
        <Tooltip title={unavailableTitle}>
          <span>
            <Button
              size="middle"
              icon={<FileSignature className="size-4" />}
              disabled
            >
              {t("settings.integrations.edo.actions.sign")}
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t("settings.integrations.edo.actions.print")}>
          <span>
            <Button
              size="middle"
              icon={<Printer className="size-4" />}
              disabled={!fileQuery.previewUrl}
              onClick={printPreview}
            >
              {t("settings.integrations.edo.actions.print")}
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t("settings.integrations.edo.actions.download")}>
          <span>
            <Button
              size="middle"
              icon={<Download className="size-4" />}
              disabled={!canDownload}
              onClick={() => onDownload(document)}
            >
              PDF
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t("common.refresh")}>
          <Button
            size="middle"
            icon={<RefreshCw className="size-4" />}
            loading={fileQuery.isFetching}
            onClick={() => void fileQuery.refetch()}
            aria-label={t("common.refresh")}
          />
        </Tooltip>

        <Tooltip title={unavailableTitle}>
          <span>
            <Button
              size="middle"
              icon={<FilePlus2 className="size-4" />}
              disabled
            >
              {t("settings.integrations.edo.actions.basedOn")}
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t("settings.integrations.edo.actions.reject")}>
          <span className="ml-auto">
            <Button
              size="middle"
              danger
              icon={<Ban className="size-4" />}
              disabled={!canReject || document.status.isTerminal}
              onClick={onReject}
            >
              {t("settings.integrations.edo.actions.reject")}
            </Button>
          </span>
        </Tooltip>
      </div>

      {/**
       * Hujjat metama'lumotlari keyingi iteratsiya uchun saqlangan.
       * Hozir foydalanuvchiga faqat hujjat preview'i ko'rsatiladi.
       *
       * <Descriptions ... />
       */}

      <div className="min-h-80 overflow-hidden rounded-xl border border-border bg-white shadow-sm dark:bg-slate-950">
          {fileQuery.isLoading ? (
            <div className="bg-surface p-5">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : fileQuery.isError ? (
            <Alert
              className="m-4"
              type="error"
              showIcon
              message={t("settings.integrations.edo.errors.inboxLoad")}
              action={
                <Button size="small" onClick={() => void fileQuery.refetch()}>
                  {t("common.reload")}
                </Button>
              }
            />
          ) : fileQuery.previewUrl ? (
            <iframe
              title={resolvedDocument.documentNumber || `EDO document ${resolvedDocument.id}`}
              src={fileQuery.previewUrl}
              className="h-[min(78vh,900px)] w-full border-0 bg-white"
            />
          ) : (
            <div className="flex min-h-80 items-center justify-center bg-surface p-6 text-sm text-secondary-text">
              {t("settings.integrations.edo.errors.inboxLoad")}
            </div>
          )}
      </div>

      {/** Status panel keyingi iteratsiya uchun saqlangan.
      <EdoDocumentStatusPanel id={document.id} direction="INBOX" />
      */}
    </div>
  );
}
