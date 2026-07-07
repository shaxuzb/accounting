import { useMemo } from "react";
import { Button, Modal, Table } from "antd";
import type { TableColumnsType } from "antd";
import { generateKeyTable } from "@/utils/utils";
import type { ProductStockSerial } from "../../warehouse/types/type";

interface Props {
  open: boolean;
  title: string;
  items: ProductStockSerial[];
  selectedRowKeys: number[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: (selected: ProductStockSerial[]) => void;
  onSelectedRowKeysChange: (keys: number[]) => void;
}

export default function InventoryAdjustmentMarkingModal({
  open,
  title,
  items,
  selectedRowKeys,
  loading = false,
  onClose,
  onConfirm,
  onSelectedRowKeysChange,
}: Props) {
  const columns: TableColumnsType<ProductStockSerial> = useMemo(
    () => [
      { dataIndex: "indexId", title: "T/r", align: "center", width: 70 },
      {
        dataIndex: "markingNumber",
        title: "Markirovka",
        render: (value) => value || "-",
      },
      {
        dataIndex: "serialNumber",
        title: "Seriya",
        render: (value) => value || "-",
      },
    ],
    [],
  );

  return (
    <Modal
      open={open}
      title={title}
      width={1000}
      destroyOnHidden
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Bekor qilish
        </Button>,
        <Button
          key="ok"
          type="primary"
          onClick={() => {
            const selected = items.filter((item) =>
              selectedRowKeys.includes(item.id),
            );
            onConfirm(selected);
          }}
        >
          Tanlanganlarni qo'shish
        </Button>,
      ]}
    >
      <div className="mb-3 text-sm text-secondary-text">
        Tanlangan markirovkalar qoldiqni tuzatish qatoriga qo'shiladi.
      </div>
      <Table<ProductStockSerial>
        size="small"
        loading={loading}
        columns={columns}
        dataSource={generateKeyTable(items, "id")}
        pagination={false}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: (keys) => onSelectedRowKeysChange(keys as number[]),
        }}
        scroll={{ x: "max-content", y: 500 }}
        locale={{ emptyText: "Markirovka topilmadi" }}
      />
    </Modal>
  );
}
