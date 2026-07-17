import { useMemo } from "react";
import { Button, Modal, Table } from "antd";
import type { TableColumnsType } from "antd";
import { generateKeyTable } from "@/utils/utils";
import type { ProductStockSerial } from "../../warehouse/types/type";
import { useTranslation } from "react-i18next";

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

export default function WarehouseTransferMarkingModal({
  open,
  title,
  items,
  selectedRowKeys,
  loading = false,
  onClose,
  onConfirm,
  onSelectedRowKeysChange,
}: Props) {
  const { t } = useTranslation();
  const columns: TableColumnsType<ProductStockSerial> = useMemo(
    () => [
      { dataIndex: "indexId", title: t("common.rowNumber"), align: "center", width: 70 },
      {
        dataIndex: "markingNumber",
        title: t("app.fields.marking"),
        render: (value) => value || "-",
      },
      {
        dataIndex: "serialNumber",
        title: t("app.fields.serial"),
        render: (value) => value || "-",
      },
    ],
    [t],
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
          {t("common.cancel")}
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
          {t("app.modals.addSelected")}
        </Button>,
      ]}
    >
      <div className="mb-3 text-sm text-secondary-text">
        {t("app.modals.warehouseHint")}
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
        locale={{ emptyText: t("app.modals.markingNotFound") }}
      />
    </Modal>
  );
}
