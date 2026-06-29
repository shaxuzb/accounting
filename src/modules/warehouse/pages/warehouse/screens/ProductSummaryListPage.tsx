import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetListWarehouse } from "../hooks/useGetListWarehouse";
import type { ProductStockGroup } from "../types/type";

export default function ProductSummaryListPage() {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching } = useGetListWarehouse(searchParams);
  const items = data?.items ?? [];

  const columns: TableColumnsType<ProductStockGroup> = [
    {
      dataIndex: "indexId",
      title: "T/r",
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: "Mahsulot turi",
      render: (_, record) => (
        <Link to={`${record.id}`} className="text-primary hover:underline">
          {record.name}
        </Link>
      ),
    },
    {
      dataIndex: "quantity",
      title: "Miqdori",
      align: "center",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "costPrice",
      title: "Sotuv narxi",
      align: "center",
      render: (value: number) => numberSpacing(value),
    },
    {
      dataIndex: "totalAmount",
      title: "Umumiy narx",
      align: "center",
      render: (value: number) => numberSpacing(value),
    },
  ];

  return (
    <Card className="overflow-hidden border border-border">
      <Table<ProductStockGroup>
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={generateKeyTable(items, "id")}
        pagination={false}
        scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
      />
    </Card>
  );
}
