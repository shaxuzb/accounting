import { Button, Modal, Space } from "antd";
import type { PurchaseProcessingMode } from "../types/form";
import { useTranslation } from "react-i18next";

interface PurchaseProcessingModeModalProps {
  open: boolean;
  loading?: boolean;
  canConfirm?: boolean;
  onClose: () => void;
  onSelect: (mode: PurchaseProcessingMode) => void;
}

export default function PurchaseProcessingModeModal({
  open,
  loading = false,
  canConfirm = false,
  onClose,
  onSelect,
}: PurchaseProcessingModeModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      title={t("purchase.actions.saveDocument")}
      footer={null}
      destroyOnHidden
      closable={!loading}
      onCancel={onClose}
      width={500}
      centered
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {t("purchase.messages.chooseSaveMode")}
      </p>
      <Space wrap>
        <Button disabled={loading} onClick={() => onSelect(1)}>
          {t("common.save")}
        </Button>
        {canConfirm && (
          <Button type="primary" loading={loading} onClick={() => onSelect(2)}>
            {t("purchase.actions.saveAndConfirm")}
          </Button>
        )}
      </Space>
    </Modal>
  );
}
