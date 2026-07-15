import { Button, Input, Modal, Space, Tag } from "antd";
import { X } from "lucide-react";
import type { SaleProductMarking } from "../types/type";

interface Props {
  open: boolean;
  productName: string;
  quantity: number;
  markings: SaleProductMarking[];
  value: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (productTableId: number) => void;
  onClose: () => void;
}

export default function SaleMarkingModal({
  open,
  productName,
  quantity,
  markings,
  value,
  loading = false,
  onChange,
  onAdd,
  onRemove,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title={`Markirovka: ${productName}`}
      footer={null}
      destroyOnHidden
      closable={!loading}
      onCancel={onClose}
      width={600}
    >
      <div className="space-y-4">
        <div className="text-sm text-secondary-text">
          Kiritilgan: {markings.length} / {quantity}
        </div>
        <div className="flex gap-2">
          <Input
            autoFocus
            value={value}
            disabled={loading || markings.length >= quantity}
            placeholder="Markirovkani kiriting yoki skanerlang"
            onChange={(event) => onChange(event.target.value)}
            onPressEnter={onAdd}
          />
          <Button
            type="primary"
            loading={loading}
            disabled={!value.trim() || markings.length >= quantity}
            onClick={onAdd}
          >
            Qo'shish
          </Button>
        </div>
        <Space wrap>
          {markings.map((marking) => (
            <Tag
              key={marking.productTableId}
              closable={!loading}
              closeIcon={<X className="size-3" />}
              onClose={() => onRemove(marking.productTableId)}
            >
              {marking.markingNumber}
            </Tag>
          ))}
        </Space>
      </div>
    </Modal>
  );
}
