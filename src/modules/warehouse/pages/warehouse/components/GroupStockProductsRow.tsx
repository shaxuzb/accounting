import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "../api";
import { queryKeys } from "../constants/queryKeys";
import WarehouseProductsTable from "./WarehouseProductsTable";

interface GroupStockProductsRowProps {
  groupId: number;
  warehouseId: number | null;
  search?: string;
  /** The stock as it stood at this moment; today's when empty. */
  onDate?: string;
}

/**
 * The products in stock inside one group, shown when its row is expanded. While searching
 * only the matching products are listed (the stock search also matches the group name, so
 * a group found by its own name lists all its products).
 */
export default function GroupStockProductsRow({
  groupId,
  warehouseId,
  search,
  onDate,
}: GroupStockProductsRowProps) {
  const params = {
    productGroupId: groupId,
    warehouseId,
    search,
    onDate,
    page: 1,
    pageSize: 1000,
  };
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products({ ...params, scope: "group-row" }),
    queryFn: () => warehouseService.products(params),
  });

  return (
    <WarehouseProductsTable
      items={data?.items ?? []}
      loading={isLoading}
      warehouseId={warehouseId}
      highlight={search}
      compact
    />
  );
}
