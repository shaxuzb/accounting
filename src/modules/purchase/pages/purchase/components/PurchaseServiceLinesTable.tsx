import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import PurchaseServiceLineModal from "./PurchaseServiceLineModal";

export interface PurchaseServiceLineForm {
  serviceId: number;
  serviceName?: string;
  price: number;
  unitId?: number | null;
  vatRateId?: number | null;
}

interface PurchaseServiceLinesTableProps {
  items: PurchaseServiceLineForm[];
  onChange: (items: PurchaseServiceLineForm[]) => void;
}

export default function PurchaseServiceLinesTable({
  items,
  onChange,
}: PurchaseServiceLinesTableProps) {
  const [open, setOpen] = useState(false);

  const columns: TableColumnsType<PurchaseServiceLineForm> = [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 70,
      align: "center",
    },
    {
      dataIndex: "serviceName",
      title: "Xizmat",
      minWidth: 240,
      render: (value, record) => value || record.serviceId,
    },
    {
      dataIndex: "serviceId",
      title: "Xizmat ID",
      width: 130,
      align: "center",
    },
    {
      dataIndex: "price",
      title: "Narxi",
      width: 160,
      align: "right",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "actions",
      title: "Amallar",
      width: 90,
      align: "center",
      render: (_, __, index) => (
        <Button
          danger
          type="text"
          icon={<Trash2 className="size-4" />}
          onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        />
      ),
    },
  ];

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="font-semibold text-text">Serinkasiz mahsulotlar</h3>
        <Button
          type="primary"
          icon={<Plus className="size-4" />}
          onClick={() => setOpen(true)}
        >
          Qo'shish
        </Button>
      </div>
      <Table<PurchaseServiceLineForm>
        size="large"
        columns={columns}
        dataSource={generateKeyTable(items)}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
      <PurchaseServiceLineModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(line) => onChange([...items, line])}
      />
    </Card>
  );
}
