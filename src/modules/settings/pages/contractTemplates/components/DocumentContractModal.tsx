import { Button, Empty, Modal, Skeleton, Spin, Tag } from "antd";
import { Download, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { downloadBlob } from "@/shared/utils/downloadBlob";
import { contractTemplateService } from "../api";
import { contractTemplateKeys } from "../constants";
import { useContractTemplates } from "../hooks";
import type { ContractDocumentKind, ContractTemplate } from "../types";

interface DocumentContractModalProps {
  open: boolean;
  onClose: () => void;
  kind: ContractDocumentKind;
  documentId: number;
  documentNumber?: string;
}

/** An object URL for a blob that lives as long as the blob does. */
const useObjectUrl = (blob?: Blob) => {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);
  return url;
};

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: ContractTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: contractTemplateKeys.preview(template.id, template.version),
    queryFn: () => contractTemplateService.preview(template.id),
    staleTime: Infinity,
    retry: false,
  });
  const url = useObjectUrl(data);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border-2 bg-white text-left transition hover:shadow-md ${
        selected ? "border-primary shadow-md" : "border-border"
      }`}
    >
      <div className="flex aspect-[210/297] w-full items-center justify-center overflow-hidden border-b border-border bg-gray-50">
        {isLoading ? (
          <Skeleton.Image active className="h-full! w-full!" />
        ) : isError || !url ? (
          <FileText className="size-10 text-muted-second" />
        ) : (
          <img src={url} alt={template.name} className="h-full w-full object-contain object-top" />
        )}
      </div>
      <div className="flex min-h-14 flex-col gap-1 p-2">
        <span className="line-clamp-2 text-sm font-medium text-text">{template.name}</span>
        <span className="flex flex-wrap gap-1">
          <Tag className="m-0!">{t(`contractTemplates.kinds.${template.kind}`)}</Tag>
          {template.isDefault && (
            <Tag color="blue" className="m-0!">
              {t("contractTemplates.fields.default")}
            </Tag>
          )}
        </span>
      </div>
    </button>
  );
}

/**
 * The contract for a document: the organization's templates of that kind as cards with a
 * picture of their first page; the chosen one is shown filled with the document — its goods
 * table built from the document's lines — and downloaded as Word or PDF.
 */
export default function DocumentContractModal({
  open,
  onClose,
  kind,
  documentId,
  documentNumber,
}: DocumentContractModalProps) {
  const { t } = useTranslation();
  const { data: all = [], isLoading } = useContractTemplates();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState<"docx" | "pdf" | null>(null);

  // this document's kind first; "other" templates fit any document
  const templates = useMemo(
    () =>
      all
        .filter((x) => x.kind === kind || x.kind === "other")
        .sort(
          (a, b) =>
            Number(b.kind === kind) - Number(a.kind === kind) ||
            Number(b.isDefault) - Number(a.isDefault) ||
            a.name.localeCompare(b.name),
        ),
    [all, kind],
  );
  const selected =
    templates.find((x) => x.id === selectedId) ?? templates[0] ?? null;

  const preview = useQuery({
    queryKey: selected
      ? contractTemplateKeys.documentPreview(selected.id, selected.version, kind, documentId)
      : ["contract-templates", "document-preview", "none"],
    queryFn: () =>
      contractTemplateService
        .renderDocument(selected!.id, { documentType: kind, documentId, format: "pdf" })
        .then((file) => file.blob),
    enabled: open && Boolean(selected),
    staleTime: 60_000,
    retry: false,
  });
  const previewUrl = useObjectUrl(preview.data);

  const download = async (format: "docx" | "pdf") => {
    if (!selected) return;
    setBusy(format);
    try {
      const file = await contractTemplateService.renderDocument(selected.id, {
        documentType: kind,
        documentId,
        format,
      });
      downloadBlob(file.blob, file.fileName);
      toast.success(t("contractTemplates.messages.rendered"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1180}
      centered
      destroyOnHidden
      title={t("contractTemplates.document.title", { number: documentNumber ?? documentId })}
      footer={
        templates.length > 0
          ? [
              <Button key="close" onClick={onClose}>
                {t("common.close")}
              </Button>,
              <Button
                key="pdf"
                icon={<Download className="size-4" />}
                loading={busy === "pdf"}
                disabled={!selected}
                onClick={() => void download("pdf")}
              >
                PDF
              </Button>,
              <Button
                key="docx"
                type="primary"
                icon={<Download className="size-4" />}
                loading={busy === "docx"}
                disabled={!selected}
                onClick={() => void download("docx")}
              >
                Word (.docx)
              </Button>,
            ]
          : null
      }
    >
      {isLoading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <Spin />
        </div>
      ) : templates.length === 0 ? (
        <Empty
          className="py-10"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("contractTemplates.document.noTemplates", {
            kind: t(`contractTemplates.kinds.${kind}`),
          })}
        />
      ) : (
        <div className="flex h-[72vh] gap-4">
          <div className="w-[300px] shrink-0 overflow-y-auto pr-1">
            <div className="mb-2 text-xs text-secondary-text">
              {t("contractTemplates.document.chooseTemplate")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={template.id === selected?.id}
                  onSelect={() => setSelectedId(template.id)}
                />
              ))}
            </div>
          </div>
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-gray-100">
            {preview.isFetching && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/70">
                <Spin />
                <span className="text-xs text-secondary-text">
                  {t("contractTemplates.document.building")}
                </span>
              </div>
            )}
            {preview.isError ? (
              <Empty
                className="pt-24"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("contractTemplates.document.previewFailed")}
              />
            ) : previewUrl ? (
              <iframe
                title={selected?.name}
                src={previewUrl}
                className="h-full w-full border-0"
              />
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
