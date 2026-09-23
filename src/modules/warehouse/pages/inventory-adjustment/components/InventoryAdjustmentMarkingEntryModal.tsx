import type { ClipboardEvent } from "react";
import { Button, Input, Modal } from "antd";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  title: string;
  value: string;
  markings: string[];
  onChange: (value: string) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onRemove: (marking: string) => void;
  onClose: () => void;
}

/**
 * Markings for stock being taken onto the books.
 *
 * A surplus is a unit that has never been seen before, so its marking is typed in
 * rather than picked from what the warehouse already holds — the same as goods
 * arriving on a purchase. Writing stock off uses the other modal, where the unit is
 * chosen from those in stock.
 */
export default function InventoryAdjustmentMarkingEntryModal({
  open,
  title,
  value,
  markings,
  onChange,
  onPaste,
  onAdd,
  onRemove,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      title={title}
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
          placeholder={t("purchase.messages.markingInputHint")}
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
            {t("purchase.messages.noMarkings")}
          </div>
        )}
      </div>
    </Modal>
  );
}
