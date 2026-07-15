import { Button, Modal, Space } from "antd";
import type { PurchaseProcessingMode } from "../types/form";

interface PurchaseProcessingModeModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSelect: (mode: PurchaseProcessingMode) => void;
}

export default function PurchaseProcessingModeModal({
  open,
  loading = false,
  onClose,
  onSelect,
}: PurchaseProcessingModeModalProps) {
  return (
    <Modal
      open={open}
      title="Hujjatni saqlash"
      footer={null}
      destroyOnHidden
      closable={!loading}
      onCancel={onClose}
      width={500}
      centered
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Hujjatni qanday holatda saqlamoqchisiz?
      </p>
      <Space wrap>
        <Button disabled={loading} onClick={() => onSelect(1)}>
          Saqlash
        </Button>
        <Button type="primary" loading={loading} onClick={() => onSelect(2)}>
          Saqlash va tasdiqlash
        </Button>
      </Space>
    </Modal>
  );
}
