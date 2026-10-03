import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { Alert, Button, Modal, Spin, Tooltip } from "antd";
import { KeyRound, RefreshCw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { contractTemplateService } from "../api";
import { contractTemplateKeys } from "../constants";
import { useContractTemplateEditor } from "../hooks";
import type { ContractTemplate } from "../types";
import ContractTemplateKeysPanel from "./ContractTemplateKeysPanel";

interface ContractTemplateEditorModalProps {
  template: ContractTemplate | null;
  onClose: () => void;
}

/**
 * The template in ONLYOFFICE, over the whole screen. "Saqlash" stores the file and closes the
 * window; closing with unsaved changes asks first, and closing without saving drops them.
 */
export default function ContractTemplateEditorModal({
  template,
  onClose,
}: ContractTemplateEditorModalProps) {
  const open = template !== null;
  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      maskClosable={false}
      keyboard={false}
      destroyOnHidden
      width="100vw"
      style={{ top: 0, maxWidth: "100vw", margin: 0, padding: 0 }}
      styles={{
        container: { padding: 0, height: "100vh", borderRadius: 0 },
        body: { height: "100vh" },
      }}
    >
      {template && <EditorWindow template={template} onClose={onClose} />}
    </Modal>
  );
}

function EditorWindow({
  template,
  onClose,
}: {
  template: ContractTemplate;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useContractTemplateEditor(
    template.id,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  // edits made since the window opened or was last saved
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [showKeys, setShowKeys] = useState(true);

  const documentKey = (data?.config.document as { key?: string } | undefined)
    ?.key;

  // leaving the page with unsaved edits asks the browser's own question
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const finish = () => {
    void queryClient.invalidateQueries({ queryKey: contractTemplateKeys.all });
    onClose();
  };

  const save = async () => {
    if (!documentKey) return;
    setSaving(true);
    try {
      const result = await contractTemplateService.saveEditor(
        template.id,
        documentKey,
      );
      toast.success(
        result.saved
          ? t("contractTemplates.editor.saved")
          : t("contractTemplates.editor.nothingToSave"),
      );
      setDirty(false);
      finish();
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    setConfirmClose(false);
    if (documentKey)
      await contractTemplateService.discardEditor(template.id, documentKey);
    finish();
  };

  const requestClose = () => (dirty ? setConfirmClose(true) : finish());

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-text">
            {template.name}
          </div>
          <div className="text-xs text-secondary-text">
            {dirty
              ? t("contractTemplates.editor.unsaved")
              : t("contractTemplates.editor.noChanges")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title={t("contractTemplates.keys.title")}>
            <Button
              type={showKeys ? "primary" : "default"}
              ghost={showKeys}
              icon={<KeyRound className="size-4" />}
              onClick={() => setShowKeys((value) => !value)}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<Save className="size-4" />}
            loading={saving}
            disabled={!documentKey}
            onClick={() => void save()}
          >
            {t("contractTemplates.editor.save")}
          </Button>
          <Tooltip title={t("common.close")}>
            <Button
              icon={<X className="size-4" />}
              disabled={saving}
              onClick={requestClose}
            />
          </Tooltip>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : isError || !data || loadError ? (
            <div className="p-4">
              <Alert
                type="error"
                showIcon
                message={t("contractTemplates.messages.editorUnavailable")}
                description={
                  <>
                    <div>
                      {t("contractTemplates.messages.editorUnavailableHint")}
                    </div>
                    {loadError && (
                      <div className="mt-1 text-xs opacity-70">{loadError}</div>
                    )}
                  </>
                }
                action={
                  <Button
                    size="small"
                    icon={<RefreshCw className="size-4" />}
                    onClick={() => {
                      setLoadError(null);
                      void refetch();
                    }}
                  >
                    {t("common.refresh")}
                  </Button>
                }
              />
            </div>
          ) : (
            // ONLYOFFICE swaps this element for its own iframe, so React must never insert
            // anything next to it: it gets a wrapper of its own
            <div className="absolute inset-0">
              <DocumentEditor
                id={`contract-template-${template.id}`}
                documentServerUrl={data.documentServerUrl}
                config={data.config}
                height="100%"
                width="100%"
                events_onDocumentStateChange={(event: { data: boolean }) => {
                  if (event.data) setDirty(true);
                }}
                onLoadComponentError={(code, description) =>
                  setLoadError(`${code}: ${description}`)
                }
              />
            </div>
          )}
          {/* always in the tree, only shown — mounting it would disturb the editor's iframe */}
          <div
            className={`absolute inset-0 z-10 flex-col items-center justify-center gap-2 bg-white/70 ${
              saving ? "flex" : "hidden"
            }`}
          >
            <Spin />
            <span className="text-sm text-secondary-text">
              {t("contractTemplates.editor.saving")}
            </span>
          </div>
        </div>
        {showKeys && (
          <aside className="flex w-80 shrink-0 flex-col border-l border-border p-3">
            <ContractTemplateKeysPanel className="h-full" />
          </aside>
        )}
      </div>

      <Modal
        open={confirmClose}
        title={t("contractTemplates.editor.closeTitle")}
        onCancel={() => setConfirmClose(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmClose(false)}>
            {t("common.cancel")}
          </Button>,
          <Button key="discard" danger onClick={() => void discard()}>
            {t("contractTemplates.editor.closeWithoutSaving")}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              setConfirmClose(false);
              void save();
            }}
          >
            {t("contractTemplates.editor.saveAndClose")}
          </Button>,
        ]}
      >
        {t("contractTemplates.editor.closeText")}
      </Modal>
    </div>
  );
}
