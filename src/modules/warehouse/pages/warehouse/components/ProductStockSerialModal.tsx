import { Modal, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { generateKeyTable } from "@/utils/utils";
import type { ProductStockSerial } from "../types/type";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  title: string;
  items: ProductStockSerial[];
  loading: boolean;
  onClose: () => void;
}

const CopyableText = ({ value }: { value?: string | null }) => {
  const text = value?.trim();

  if (!text) {
    return <span>-</span>;
  }

  return (
    <Typography.Text
      copyable={{ text }}
      className="block max-w-none select-text whitespace-nowrap font-mono text-xs"
    >
      {text}
    </Typography.Text>
  );
};

export default function ProductStockSerialModal({
  open,
  title,
  items,
  loading,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const columns: TableColumnsType<ProductStockSerial> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    // {
    //   dataIndex: "serialNumber",
    //   title: "Seriya raqami",
    //   width: 280,
    //   render: (value) => <CopyableText value={value} />,
    // },
    {
      dataIndex: "markingNumber",
      title: t("warehouse.fields.markingNumber"),
      render: (value) => <CopyableText value={value} />,
    },
  ];

  return (
    <Modal
      open={open}
      title={title}
      footer={null}
      width={1000}
      destroyOnHidden
      onCancel={onClose}
    >
      <Table<ProductStockSerial>
        size="small"
        loading={loading}
        columns={columns}
        dataSource={generateKeyTable(items, "id")}
        pagination={false}
        scroll={{ x: "max-content", y: 500 }}
        locale={{ emptyText: t("warehouse.messages.noMarkings") }}
      />
    </Modal>
  );
}
