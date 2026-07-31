import { displayDate } from "@/modules/payroll/utils/format";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  App,
  Button,
  Empty,
  List,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { Download, Eye, FileImage, FileText, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useDeleteHrAbsenceAttachment,
  useHrAbsenceDetail,
} from "../hooks";
import { hrAbsenceService } from "../services/hrAbsenceService";
import type { HrAbsenceAttachment } from "../types/type";

interface Props {
  open: boolean;
  absenceId?: number | null;
  onClose: () => void;
}

interface PreviewState {
  name: string;
  contentType: string;
  url: string;
}

const formatFileSize = (size?: number | null) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const isPreviewable = (contentType?: string | null) =>
  Boolean(contentType?.startsWith("image/") || contentType === "application/pdf");

export default function HrAbsenceAttachmentsModal({
  open,
  absenceId,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { data: absence, isFetching } = useHrAbsenceDetail(
    open ? absenceId : null,
  );
  const deleteMutation = useDeleteHrAbsenceAttachment(absenceId ?? 0);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview?.url]);

  const attachments = useMemo(
    () => absence?.attachments ?? [],
    [absence?.attachments],
  );

  const closePreview = () => setPreview(null);

  const handleDownload = async (
    attachment: Pick<HrAbsenceAttachment, "id" | "originalFileName">,
  ) => {
    if (!absenceId) return;
    try {
      const blob = await hrAbsenceService.downloadAttachment(
        absenceId,
        attachment.id,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = attachment.originalFileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      errorHandlers(error);
    }
  };

  const handlePreview = async (attachment: HrAbsenceAttachment) => {
    if (!absenceId || !isPreviewable(attachment.contentType)) return;
    setPreviewLoadingId(attachment.id);
    try {
      const blob = await hrAbsenceService.downloadAttachment(
        absenceId,
        attachment.id,
      );
      setPreview({
        name: attachment.originalFileName,
        contentType: attachment.contentType ?? "",
        url: URL.createObjectURL(blob),
      });
    } catch (error) {
      errorHandlers(error);
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const handleDelete = (attachment: HrAbsenceAttachment) => {
    if (!absenceId) return;
    modal.confirm({
      title: t("hr.absences.deleteDocumentTitle"),
      content: attachment.originalFileName,
      okText: t("common.delete"),
      cancelText: t("common.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(attachment.id);
          toast.success(t("hr.messages.attachmentDeleted"));
        } catch (error) {
          errorHandlers(error);
        }
      },
    });
  };

  return (
    <>
      <Modal
        title={t("hr.absences.attachmentsTitle")}
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={760}
        destroyOnHidden
      >
        <Spin spinning={isFetching}>
          <div className="mb-4 rounded-lg border border-border bg-fill-quaternary px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Typography.Text strong>
                  {absence?.docNumber ?? "-"}
                </Typography.Text>
                <div className="mt-1 text-sm text-secondary-text">
                  {absence?.employeeName ?? "-"}
                </div>
              </div>
              <Tag color="blue">
                {absence
                  ? `${displayDate(absence.startDate)} - ${displayDate(absence.endDate)}`
                  : "-"}
              </Tag>
            </div>
          </div>

          {attachments.length ? (
            <List
              className="rounded-lg border border-border"
              dataSource={attachments}
              itemLayout="horizontal"
              renderItem={(attachment) => {
                const previewable = isPreviewable(attachment.contentType);
                const Icon = attachment.contentType?.startsWith("image/")
                  ? FileImage
                  : FileText;

                return (
                  <List.Item
                    actions={[
                      previewable ? (
                        <Tooltip
                          key="preview"
                          title={t("hr.absences.viewDocument")}
                        >
                          <Button
                            type="text"
                            icon={<Eye className="size-4" />}
                            loading={previewLoadingId === attachment.id}
                            onClick={() => void handlePreview(attachment)}
                          />
                        </Tooltip>
                      ) : null,
                      <Tooltip
                        key="download"
                        title={t("hr.absences.downloadDocument")}
                      >
                        <Button
                          type="text"
                          icon={<Download className="size-4" />}
                          onClick={() => void handleDownload(attachment)}
                        />
                      </Tooltip>,
                      <Tooltip
                        key="delete"
                        title={t("hr.absences.deleteDocument")}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="size-4" />}
                          loading={deleteMutation.isPending}
                          onClick={() => handleDelete(attachment)}
                        />
                      </Tooltip>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={<Icon className="mt-1 size-5 text-primary" />}
                      title={
                        <Typography.Text ellipsis={{ tooltip: true }}>
                          {attachment.originalFileName}
                        </Typography.Text>
                      }
                      description={
                        <span>
                          {attachment.contentType ?? t("hr.absences.file")}
                          {" | "}
                          {formatFileSize(attachment.fileSize)}
                          {attachment.createdDate
                            ? ` | ${displayDate(attachment.createdDate)}`
                            : ""}
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty description={t("hr.absences.attachmentsEmpty")} />
          )}
        </Spin>
      </Modal>

      <Modal
        title={preview?.name}
        open={Boolean(preview)}
        onCancel={closePreview}
        footer={null}
        centered
        width={960}
        destroyOnHidden
      >
        {preview?.contentType.startsWith("image/") ? (
          <div className="flex max-h-[70vh] justify-center overflow-auto rounded-lg bg-black/5 p-2">
            <img
              src={preview.url}
              alt={preview.name}
              className="max-h-[65vh] max-w-full object-contain"
            />
          </div>
        ) : preview?.contentType === "application/pdf" ? (
          <iframe
            title={preview.name}
            src={preview.url}
            className="h-[70vh] w-full rounded-lg border border-border"
          />
        ) : null}
      </Modal>
    </>
  );
}
