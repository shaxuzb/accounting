import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import dayjs from "dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { formatDateWithOutTime } from "@/utils/helpers";
import { numberSpacing } from "@/utils/utils";
import PricingConditionAddEditPage from "./PricingConditionAddEditPage";
import { useGetListPricingCondition } from "../hooks/useGetListPricingCondition";
import { pricingConditionPermissions } from "../constants/permissions";
import type { PricingCondition } from "../types/type";

export default function PricingConditionListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListPricingCondition(searchParams);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  const permissions = user?.user.permissions ?? [];

  const tableColumns: TableColumnsType<PricingCondition> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      title: t("settings.fields.pricingMethod"),
      dataIndex: "pricingMethodName",
    },
    {
      title: t("settings.fields.pricingValue"),
      dataIndex: "pricingValue",
      align: "center",
      render: (value) => numberSpacing(value),
    },
    {
      title: t("settings.fields.roundingMethod"),
      dataIndex: "roundingMethodName",
      align: "center",
    },
    {
      title: t("settings.fields.roundingPrecision"),
      dataIndex: "roundingPrecision",
      align: "center",
      render: (value) => numberSpacing(value),
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

  const hasActions = permissions.includes(pricingConditionPermissions.delete);

  const columns: TableColumnType<PricingCondition>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="pricing-conditions"
              customPath={`/main/settings/pricing-conditions/view/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: pricingConditionPermissions.delete,
                editCode: pricingConditionPermissions.detail,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setViewId((value as PricingCondition)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={pricingConditionPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => {
                setViewId(null);
                setIsAddOpen(true);
              }}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<PricingCondition>
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{ x: "max-content", y: "calc(100vh - 350px)" }}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
        />
      </Card>

      <PricingConditionAddEditPage
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setViewId(null);
        }}
        id={viewId}
      />
    </div>
  );
}
