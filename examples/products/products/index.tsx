import ButtonAdd from "@/components/ui/buttons/ButtonAdd";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SupplierFilter from "@/components/ui/filters/SupplierFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { productTypePermission } from "@/modules/warehouses/constants/permissions";
import { useGetListProductTypes } from "@/modules/warehouses/hooks/useGetListProductTypes";
import { ProductTypeData } from "@/modules/warehouses/types/warehouse";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { Table, TableColumnType, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { useTableScrollRestore } from "@/hooks/useTableScrollRestore";

const PRODUCTS_LIST_PATH = "/main/warehouses/products";
const PRODUCTS_CHILD_PATH_PATTERNS = [
  /^\/main\/warehouses\/products\/add$/,
  /^\/main\/warehouses\/products\/edit\/[^/]+$/,
];

const Products = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth?.user);
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListProductTypes(searchParams);
  const { tableWrapperRef } = useTableScrollRestore({
    storageKey: `products-table-scroll:${searchParams.toString()}`,
    listPath: PRODUCTS_LIST_PATH,
    childPathPatterns: PRODUCTS_CHILD_PATH_PATTERNS,
    enabled: Boolean(data?.results?.length && !isLoading && !isFetching),
    restoreDelay: 150,
  });
  const tableColumnLabels: TableColumnType<ProductTypeData>[] = [
    {
      dataIndex: "indexId",
      title: t("Table.ordinalNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: t("Table.productType"),
      render: (value, record) => {
        return <Link to={`edit/${record.id.toString()}`}>{value}</Link>;
      },
    },
    {
      dataIndex: "state",
      title: t("Table.state"),
      width: 110,
      align: "center",
      render(value, record) {
        return (
          <Tag color={record.stateId === 1 ? "green" : "red"}>{value}</Tag>
        );
      },
    },
  ];
  const hasActions =
    user?.user.permissions.includes(productTypePermission.UPDATE) ||
    user?.user.permissions.includes(productTypePermission.DELETE);

  const columns: TableColumnType<ProductTypeData>[] = hasActions
    ? [
        ...tableColumnLabels,
        {
          dataIndex: "actions",
          title: t("Table.actions"),
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="product-types"
              // customPatn={`/main/role/edit/${record.id}`}
              record={record}
              permissions={user?.user.permissions || []}
              permissionsCode={{
                deleteCode: productTypePermission.DELETE,
                editCode: productTypePermission.UPDATE,
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumnLabels;
  return (
    <div className="w-full">
      <div className="mb-3 flex gap-2">
        <PermissionCard permission={productTypePermission.CREATE}>
          <ButtonAdd to="add" />
        </PermissionCard>
        <SupplierFilter />
      </div>
      <div ref={tableWrapperRef}>
        <Table
          dataSource={generateKeyTable(data?.results)}
          pagination={false}
          scroll={{
            y: "calc(100vh - 180px)",
            x: "max-content",
          }}
          loading={isLoading || isFetching}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Products;
