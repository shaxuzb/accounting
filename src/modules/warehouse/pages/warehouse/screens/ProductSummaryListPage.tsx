import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { warehousePermissions } from "../constants/permissions";
import type { WarehouseAll } from "../types/type";
import { useGetListWarehouse } from "../hooks/useGetListWarehouse";

export default function ProductSummaryListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
//   const { user } = useAppSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching } =
    useGetListWarehouse(searchParams);
  const items = data?.items ?? data?.items ?? [];
//   const permissions = user?.user.permissions ?? [];

  const tableColumns: TableColumnsType<WarehouseAll> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: t("warehouses.fields.warehouseName"),
      minWidth: 180,
      render: (value, record) => <Link to={`edit/${record.id}`}>{value}</Link>,
    },
    {
      dataIndex: "unitName",
      title: t("warehouses.fields.description"),
      minWidth: 180,
    },
    // {
    //   dataIndex: "stateId",
    //   title: t("warehouses.fields.status"),
    //   width: 120,
    //   align: "center",
    //   render: (_, record) =>
    //     stateStatus(record.stateId, (record as any).stateName),
    // },
  ];

//   const hasActions =
//     permissions.includes(warehousePermissions.update) ||
//     permissions.includes(warehousePermissions.delete);

//   const columns: TableColumnType<WarehouseAll>[] = hasActions
//     ? [
//         ...tableColumns,
//         {
//           dataIndex: "actions",
//           title: t("common.actions"),
//           align: "center",
//           width: 100,
//           fixed: "right",
//           render: (_, record) => (
//             <ActionColumn
//               deletePath="warehouse-groups"
//               customPath={`/main/warehouses/edit/${record.id}`}
//               record={record}
//               permissions={permissions}
//             //   permissionsCode={{
//             //     deleteCode: warehousePermissions.delete,
//             //     editCode: warehousePermissions.update,
//             //   }}
//               refetch={refetch}
//             />
//           ),
//         },
//       ]
//     : tableColumns;

  return (
    <div className="w-full">
      {/* <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
          />
          <PermissionCard permission={warehousePermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("add")}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        </Space>
      </div> */}
      <Card className="overflow-hidden border border-border">
        <Table<WarehouseAll>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={generateKeyTable(items)}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
        />
      </Card>
    </div>
  );
}
