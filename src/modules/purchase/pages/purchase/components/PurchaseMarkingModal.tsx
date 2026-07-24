import type { ClipboardEvent } from "react";
import { Button, Input, Modal } from "antd";
import { Plus, X } from "lucide-react";

interface PurchaseMarkingModalProps {
  open: boolean;
  value: string;
  markings: string[];
  onChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onRemove: (marking: string) => void;
  onClose: () => void;
}

export default function PurchaseMarkingModal({
  open,
  value,
  markings,
  onChange,
  onPaste,
  onAdd,
  onRemove,
  onClose,
}: PurchaseMarkingModalProps) {
  return (
    <Modal
      title="Markirovkalarni kiritish"
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
          placeholder="Markirovkalarni kiriting yoki Exceldan paste qiling"
          onChange={(event) => onChange(event.target.value)}
          onPaste={onPaste}
          onPressEnter={onAdd}
        />
        <Button type="primary" icon={<Plus className="size-4" />} onClick={onAdd}>
          Qo'shish
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
            Markirovka kiritilmagan
          </div>
        )}
      </div>
    </Modal>
  );
}
