import { Button, Segmented, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import dayjs from "dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { formatDateWithOutTime } from "@/utils/helpers";
import SaleConditionAddEditPage from "./SaleConditionAddEditPage";
import SaleConditionNowView from "./SaleConditionNowView";
import { useGetListSaleCondition } from "../hooks/useGetListSaleCondition";
import { saleConditionPermissions } from "../constants/permissions";
import type { SaleCondition } from "../types/type";

type TabKey = "current" | "history";

export default function SaleConditionListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<TabKey>("current");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, refetch, isLoading, isFetching } = useGetListSaleCondition(
    searchParams,
  );
  const permissions = user?.user.permissions ?? [];

  const tableColumns: TableColumnsType<SaleCondition> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      title: t("settings.fields.costingMethod"),
      dataIndex: "costingMethodName",
    },
    {
      title: t("settings.fields.vatRate"),
      dataIndex: "vatRateName",

    },
    {
      title: t("settings.fields.startDate"),
      dataIndex: "startDate",
      align: "center",

      render: (value) =>
        value ? dayjs(value).format(formatDateWithOutTime) : "—",
    },
    {
      title: t("settings.fields.endDate"),
      dataIndex: "endDate",
      align: "center",
      render: (value) =>
        value ? dayjs(value).format(formatDateWithOutTime) : "—",
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "stateId",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const hasActions = permissions.includes(saleConditionPermissions.delete);

  const columns: TableColumnType<SaleCondition>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="sale-conditions"
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: saleConditionPermissions.delete,
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
        <Segmented<TabKey>
          value={tab}
          onChange={(value) => setTab(value)}
          options={[
            { label: t("settings.saleCondition.current"), value: "current" },
            { label: t("settings.saleCondition.history"), value: "history" },
          ]}
        
          
        />
        <Space>
          {tab === "history" && (
            <Button
              icon={<RefreshCw className="size-4" />}
              onClick={() => refetch()}
            />
          )}
          <PermissionCard permission={saleConditionPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >
              {t("settings.saleCondition.create")}
            </Button>
          </PermissionCard>
        </Space>
      </div>

      {tab === "current" ? (
        <SaleConditionNowView />
      ) : (
        <Card className="overflow-hidden border border-border">
          <Table<SaleCondition>
            loading={isLoading || isFetching}
            columns={columns}
            scroll={{ x: "max-content", y: "calc(100vh - 350px)" }}
            dataSource={generateKeyTable(data?.items ?? [], "id")}
            pagination={false}
          />
        </Card>
      )}

      <SaleConditionAddEditPage
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}
