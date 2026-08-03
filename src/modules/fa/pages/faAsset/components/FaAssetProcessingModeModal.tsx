import { Button, Modal, Space } from "antd";
import { useTranslation } from "react-i18next";
import type { FaAssetProcessingMode } from "../types/form";

interface FaAssetProcessingModeModalProps {
  open: boolean;
  loading: boolean;
  canConfirm: boolean;
  onClose: () => void;
  onSelect: (mode: FaAssetProcessingMode) => void;
}

export default function FaAssetProcessingModeModal({
  open,
  loading,
  canConfirm,
  onClose,
  onSelect,
}: FaAssetProcessingModeModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      title={t("fa.actions.saveDocument")}
      footer={null}
      destroyOnHidden
      closable={!loading}
      onCancel={onClose}
      width={500}
      centered
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {t("fa.messages.chooseSaveMode")}
      </p>
      <Space wrap>
        <Button disabled={loading} onClick={() => onSelect(1)}>
          {t("common.save")}
        </Button>
        {canConfirm && (
          <Button type="primary" loading={loading} onClick={() => onSelect(2)}>
            {t("fa.actions.saveAndConfirm")}
          </Button>
        )}
      </Space>
    </Modal>
  );
}
