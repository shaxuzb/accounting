import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import { CorrectionStatusTag } from "@/modules/corrections/CorrectionListPage";
import { money } from "@/modules/corrections/constants";
import FaAssetKindTag from "../../shared/components/FaAssetKindTag";
import { FaAssetKindFilter } from "../../shared/components/FaListFilters";
import { useFaInventories, type FaInventoryListItem } from "./api";
import { faInventoryPath, faInventoryPermissions } from "./constants";

/** Inventories of fixed and intangible assets (1C «Инвентаризация ОС» / «Инвентаризация НМА»). */
export default function FaInventoryListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assetKindId = searchParams.get("assetKindId") || undefined;
  const { data = [], isLoading, isFetching, refetch } = useFaInventories({
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    assetKindId,
  });

  const columns: TableColumnsType<FaInventoryListItem> = [
    { dataIndex: "docNumber", title: "№", width: 80 },
    {
      dataIndex: "docDate",
      title: t("fa.inventory.date"),
      width: 120,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
    },
    {
      dataIndex: "assetKindId",
      title: t("fa.kinds.title"),
      width: 170,
      render: (value: number) => <FaAssetKindTag assetKindId={value} />,
    },
    {
      key: "place",
      title: t("fa.inventory.department"),
      render: (_: unknown, record) =>
        [record.departmentName, record.responsibleUserName].filter(Boolean).join(" · ") || t("fa.inventory.allPlaces"),
    },
    { dataIndex: "assetCount", title: t("fa.inventory.assetCount"), align: "right", width: 110 },
    {
      key: "shortage",
      title: t("fa.inventory.shortage"),
      align: "right",
      width: 170,
      render: (_: unknown, record) =>
        record.shortageCount ? (
          <span className="text-red-600">
            {record.shortageCount} · {money(record.shortageValue)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "surplus",
      title: t("fa.inventory.surplus"),
      align: "right",
      width: 170,
      render: (_: unknown, record) =>
        record.surplusCount ? (
          <span className="text-green-700">
            {record.surplusCount} · {money(record.surplusValue)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "statusId",
      title: t("currency.status.title"),
      align: "center",
      width: 130,
      render: (value: number) => <CorrectionStatusTag statusId={value} />,
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <FaAssetKindFilter />
            <DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />
          </>
        }
        actions={
          <PermissionCard permission={faInventoryPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate(`${faInventoryPath}/new${assetKindId ? `?kind=${assetKindId}` : ""}`)}
            >
              {t("fa.inventory.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<FaInventoryListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${faInventoryPath}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
