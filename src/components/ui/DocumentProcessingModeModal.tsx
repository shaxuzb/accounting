import { Button, Modal, Space } from "antd";

export type DocumentProcessingMode = 1 | 2;

interface Props {
  open: boolean;
  title: string;
  description: string;
  saveLabel: string;
  saveAndConfirmLabel: string;
  loading?: boolean;
  canConfirm?: boolean;
  onClose: () => void;
  onSelect: (mode: DocumentProcessingMode) => void;
}

export default function DocumentProcessingModeModal({
  open,
  title,
  description,
  saveLabel,
  saveAndConfirmLabel,
  loading = false,
  canConfirm = false,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal maskClosable={false}
      open={open}
      title={title}
      footer={null}
      destroyOnHidden
      closable={!loading}
      onCancel={onClose}
      width={500}
      centered
    >
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {/* Saving as a draft is the safe default and the highlighted one: posting a
          document writes stock and ledger entries, and taking them back is a separate
          cancellation, so it must be the deliberate choice, not the first button. */}
      <Space wrap>
        <Button type="primary" loading={loading} onClick={() => onSelect(1)}>
          {saveLabel}
        </Button>
        {canConfirm && (
          <Button disabled={loading} onClick={() => onSelect(2)}>
            {saveAndConfirmLabel}
          </Button>
        )}
      </Space>
    </Modal>
  );
}
