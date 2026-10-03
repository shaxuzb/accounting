import { useParams, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { filterIds } from "@/shared/constants/selectLists";
import WarehouseProductsTable from "../components/WarehouseProductsTable";
import { useGetDetailWarehouse } from "../hooks/useGetDetailWarehouse";

export default function ProductDetail() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();

  const productGroupId = Number(id) || null;
  const warehouseIdParam = searchParams.get(filterIds.warehouse);
  const warehouseId = warehouseIdParam ? Number(warehouseIdParam) : null;
  const { data, isLoading, isFetching } = useGetDetailWarehouse({
    productGroupId,
    page: 1,
    pageSize: 1000,
    warehouseId,
  });

  return (
    <div className="w-full space-y-3">
      <Card className="overflow-hidden border border-border">
        <WarehouseProductsTable
          items={data?.items ?? []}
          loading={isLoading || isFetching}
          warehouseId={warehouseId}
        />
      </Card>
    </div>
  );
}
