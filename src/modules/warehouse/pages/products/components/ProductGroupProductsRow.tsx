import { Empty, Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { stateStatus } from "@/utils/helpers/statusHelper";
import SearchHighlight from "@/components/ui/table/SearchHighlight";
import { productEndpoints } from "../constants/endpoints";

interface GroupProduct {
  id: number;
  name: string;
  code?: string | null;
  barcode?: string | null;
  mxik?: string | null;
  unitName?: string;
  stateId: number;
  stateName?: string;
}

interface ProductGroupProductsRowProps {
  groupId: number;
  isService: boolean;
  search?: string;
}

const fetchGroupProducts = (groupId: number, isService: boolean, search?: string) =>
  $axiosPrivate
    .get<Paginated<GroupProduct>>(productEndpoints.products, {
      params: {
        productGroupId: groupId,
        isService,
        search: search || undefined,
        page: 1,
        pageSize: 500,
      },
    })
    .then((res) => res.data.items ?? []);

/**
 * The products inside one group, shown when its row is expanded. While searching only the
 * products that match are listed; a group found by its own name lists all its products.
 */
export default function ProductGroupProductsRow({
  groupId,
  isService,
  search,
}: ProductGroupProductsRowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const matching = useQuery({
    queryKey: ["product-groups", groupId, "products", isService, search ?? ""],
    queryFn: () => fetchGroupProducts(groupId, isService, search),
  });
  // the group matched by its name, not by a product: show what it holds
  const needsAll = Boolean(search) && matching.isSuccess && matching.data.length === 0;
  const all = useQuery({
    queryKey: ["product-groups", groupId, "products", isService, ""],
    queryFn: () => fetchGroupProducts(groupId, isService),
    enabled: needsAll,
  });

  const items = needsAll ? (all.data ?? []) : (matching.data ?? []);
  const loading = matching.isLoading || (needsAll && all.isLoading);
  const highlight = needsAll ? undefined : search;

  const columns: TableColumnsType<GroupProduct> = [
    {
      dataIndex: "name",
      title: isService ? t("products.fields.serviceType") : t("warehouse.fields.productName"),
      render: (value) => <SearchHighlight text={value} search={highlight} />,
    },
    {
      dataIndex: "mxik",
      title: t("warehouse.fields.mxik"),
      render: (value) => <SearchHighlight text={value} search={highlight} />,
    },
    {
      dataIndex: "barcode",
      title: t("warehouse.fields.barcode"),
      render: (value) => <SearchHighlight text={value} search={highlight} />,
    },
    {
      dataIndex: "unitName",
      title: t("purchase.fields.unit"),
      render: (value) => value || "—",
    },
    {
      dataIndex: "stateId",
      title: t("products.fields.status"),
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center py-3">
        <Spin size="small" />
      </div>
    );

  return (
    <Table<GroupProduct>
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={items}
      pagination={false}
      className="my-1"
      onRow={() => ({
        className: "cursor-pointer",
        onClick: () => navigate(`edit/${groupId}?isService=${isService}`),
      })}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }}
    />
  );
}
