import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, ReceiptText, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { saleEndpoints } from "../constants/endpoints";
import { salePermissions } from "../constants/permissions";
import { useGetListSale } from "../hooks";
import type { SaleDoc } from "../types/type";

export default function SaleListPage() {
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetListSale(searchParams);

  const tableColumns: TableColumnsType<SaleDoc> = [
    {
      dataIndex: "indexId",
      title: "№",
      width: 70,
      align: "center",
    },
    {
      title: "Hujjat raqami",
      dataIndex: "docNumber",
      minWidth: 150,
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: "Provodka",
      align: "center",
      width: 110,
      render: (_, record) => (
        <Link
          to={`/main/accountingentriesreport?documentTypeId=2&documentId=${record.id}`} 
        >
          <Button icon={<ReceiptText className="size-4" />} />
        </Link>
      ),
    },
    {
      title: "Sana",
      dataIndex: "docDate",
      width: 130,
      align: "center",
      render: customDate,
    },
    {
      title: "Kontragent",
      dataIndex: "counterpartyName",
      minWidth: 200,
      align: "center",
    },
    {
      title: "Ombor",
      dataIndex: "warehouseName",
      minWidth: 160,
      align: "center",
    },
    {
      title: "Summa",
      dataIndex: "totalAmount",
      width: 160,
      align: "right",
      render: (value, record) =>
        `${numberSpacing(value)} ${record.currencyCode ?? ""}`.trim(),
    },
    {
      title: "Holat",
      dataIndex: "statusName",
      width: 130,
      align: "center",
      render: (_, record) =>
        stateStatus(
          record.stateId ?? record.statusId ?? 0,
          record.stateName ?? record.statusName ?? "-",
        ),
    },
  ];

  const hasActions =
    permissions.includes(salePermissions.update) ||
    permissions.includes(salePermissions.delete);
  const columns: TableColumnType<SaleDoc>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: "Amallar",
          align: "center",
          width: 90,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={saleEndpoints.docs.list}
              customPath={`/main/sale/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode: salePermissions.update,
                deleteCode: salePermissions.delete,
              }}
              refetch={refetch}
            />
          ),
        },


      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={salePermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                Qo'shish
              </Button>
            </Link>
          </PermissionCard>
        </Space>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<SaleDoc>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
      </Card>
    </div>
  );
}
