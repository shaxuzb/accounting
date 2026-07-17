import { Button, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/card/Card";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  filterIds,
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import type { SelectData } from "@/shared/types";
import { getLocalizedLabel } from "@/shared/utils/localizedLabel";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetListWarehouse } from "../hooks/useGetListWarehouse";
import type { ProductStockGroup } from "../types/type";

const fetchWarehouses = async (): Promise<SelectData[]> => {
  const { data } = await $axiosPrivate.get<SelectData[]>(
    selectListEndpoints.warehousesSelectList,
  );
  return data;
};

export default function ProductSummaryListPage() {
  const lang = useAppSelector((state) => state.lang.lang);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: warehouses = [], isLoading: isWarehousesLoading } = useQuery({
    queryKey: [selectListKeys.warehouse],
    queryFn: fetchWarehouses,
  });
  const { data, isLoading, isFetching, refetch } =
    useGetListWarehouse(searchParams);
  const items = data?.items ?? [];

  const warehouseId = searchParams.get(filterIds.warehouse);
  const selectedWarehouseId = warehouseId ? Number(warehouseId) : undefined;
  const detailQuery = warehouseId
    ? `?${filterIds.warehouse}=${encodeURIComponent(warehouseId)}`
    : "";

  const handleWarehouseChange = (value: string | number | undefined) => {
    const next = new URLSearchParams(searchParams);

    if (value === undefined) {
      next.delete(filterIds.warehouse);
    } else {
      next.set(filterIds.warehouse, String(value));
    }

    setSearchParams(next, { replace: true });
  };

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
        <Link
          to={`${record.id}${detailQuery}`}
          className="text-primary hover:underline"
        >
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
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SearchFilter />
          <Select
            allowClear
            loading={isWarehousesLoading}
            value={selectedWarehouseId}
            onChange={handleWarehouseChange}
            options={warehouses.map((warehouse) => ({
              value: warehouse.id,
              label: getLocalizedLabel(warehouse, lang),
            }))}
            placeholder="Ombor"
            className="min-w-48"
            popupMatchSelectWidth={false}
          />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<ProductStockGroup>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(items, "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
        />
      </Card>
    </div>
  );
}
