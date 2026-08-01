import { Button, Segmented, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { useGetListProducts } from "../hooks";
import { productPermissions } from "../constants/permissions";
import type { ProductType } from "../types/type";

export default function ProductListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();
  const isService = searchParams.get("isService") === "true";

  const queryParams = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.set("IsService", String(isService));
    next.delete("isService");
    return next;
  }, [searchParams, isService]);

  const { data, isLoading, isFetching, refetch } =
    useGetListProducts(queryParams);
  const items = data?.items ?? data?.results ?? [];
  const permissions = user?.user.permissions ?? [];

  const handleSegmentChange = (value: string | number) => {
    const next = new URLSearchParams(searchParams);
    if (value === "services") next.set("isService", "true");
    else next.delete("isService");
    setSearchParams(next, { replace: true });
  };

  const tableColumns: TableColumnsType<ProductType> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      width: 10,
      align: "center",
    },
    {
      dataIndex: "name",
      title: isService
        ? t("products.fields.serviceType")
        : t("products.fields.productType"),
      render: (value, record) => (
        <Link to={`edit/${record.id}?isService=${isService}`}>{value}</Link>
      ),
    },
    {
      dataIndex: "description",
      title: t("products.fields.description"),
    },
     {
      dataIndex: "createdDate",
      title: t("settings.fields.createdDate"),
      align: "center",
      render: (value) => customDate(value)
    },
    {
      dataIndex: "stateId",
      title: t("products.fields.status"),
      align: "center",
      render: (_, record) =>
        stateStatus(record.stateId, record.stateName),
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
              deletePath="product-groups"
              customPath={`/main/warehouses/products/edit/${record.id}?isService=${isService}`}
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
        <div className="flex items-center gap-3">
          <Segmented
            value={isService ? "services" : "products"}
            onChange={handleSegmentChange}
            options={[
              { label: t("products.segments.products"), value: "products" },
              { label: t("products.segments.services"), value: "services" },
            ]}
          />
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
          />
          <PermissionCard permission={productPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate(`add?isService=${isService}`)}
            >
              {isService
                ? t("products.actions.addService")
                : t("common.add")}
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
