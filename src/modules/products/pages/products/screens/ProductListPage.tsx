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
import { useGetListProducts } from "../hooks";
import { productPermissions } from "../constants/permissions";
import type { ProductType } from "../types/type";

export default function ProductListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } = useGetListProducts(searchParams);
  const items = data?.items ?? data?.results ?? [];
  const permissions = user?.user.permissions ?? [];

  const tableColumns: TableColumnsType<ProductType> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: t("products.fields.productType"),
      minWidth: 180,
      render: (value, record) => <Link to={`edit/${record.id}`}>{value}</Link>,
    },
    {
      dataIndex: "description",
      title: t("products.fields.description"),
      minWidth: 180,
    },
    {
      dataIndex: "stateId",
      title: t("products.fields.status"),
      width: 120,
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.state),
    },
  ];

  const hasActions =
    permissions.includes(productPermissions.update) ||
    permissions.includes(productPermissions.delete);

  const columns: TableColumnType<ProductType>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="product-types"
              customPath={`/main/products/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: productPermissions.delete,
                editCode: productPermissions.update,
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
          <Button icon={<RefreshCw className="size-4" />} onClick={() => refetch()} />
          <PermissionCard permission={productPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("add")}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<ProductType>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(items, "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
        />
      </Card>
    </div>
  );
}
