import type { ClipboardEvent } from "react";
import { Button, Input, Modal } from "antd";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OpeningInventoryMarkingModalProps {
  open: boolean;
  value: string;
  markings: string[];
  onChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onRemove: (marking: string) => void;
  onClose: () => void;
}

export default function OpeningInventoryMarkingModal({
  open,
  value,
  markings,
  onChange,
  onPaste,
  onAdd,
  onRemove,
  onClose,
}: OpeningInventoryMarkingModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("openingInventory.actions.enterMarkings")}
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnHidden
    >
      <div className="flex gap-2">
        <Input
          autoFocus
          value={value}
          placeholder={t("openingInventory.messages.markingInputHint")}
          onChange={(event) => onChange(event.target.value)}
          onPaste={onPaste}
          onPressEnter={onAdd}
        />
        <Button type="primary" icon={<Plus className="size-4" />} onClick={onAdd}>
          {t("common.add")}
        </Button>
      </div>
      <div className="mt-3 flex max-h-64 flex-col gap-2 overflow-auto rounded border border-border bg-card p-2">
        {markings.length ? (
          markings.map((marking) => (
            <div
              key={marking}
              className="flex items-center justify-between gap-3 rounded bg-surface-muted px-3 py-2 text-sm text-text"
            >
              <span className="break-all">{marking}</span>
              <Button
                type="text"
                danger
                icon={<X className="size-4" />}
                onClick={() => onRemove(marking)}
              />
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-secondary-text">
            {t("openingInventory.messages.noMarkings")}
          </div>
        )}
      </div>
    </Modal>
  );
}
