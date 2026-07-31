import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import {
  componentTypeColor,
  componentTypeOptions,
  stateFilterOptions,
} from "@/modules/payroll/constants/options";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { numberSpacing } from "@/utils/utils";
import { Button, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { payrollComponentEndpoints } from "../constants/endpoints";
import { payrollComponentPermissions } from "../constants/permissions";
import { payrollComponentKeys } from "../constants/queryKeys";
import { useGetListPayrollComponents } from "../hooks";
import type { PayrollComponent } from "../types/type";
import PayrollComponentAddEditPage from "./PayrollComponentAddEditPage";

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format("DD.MM.YYYY") : "—";

export default function PayrollComponentListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const queryClient = useQueryClient();
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListPayrollComponents(searchParams);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const openCreate = () => {
    setEditId(null);
    setIsFormOpen(true);
  };

  const columns: TableColumnsType<PayrollComponent> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "sortOrder",
      title: t("payroll.fields.sortOrder"),
      align: "center",
      width: 90,
    },
    {
      dataIndex: "code",
      title: t("payroll.fields.componentCode"),
      width: 130,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      dataIndex: "name",
      title: t("payroll.fields.componentName"),
      minWidth: 220,
      render: (value: string, record) => (
        <div className="flex flex-col">
          <span>{value}</span>
          {record.isMandatory && (
            <span className="text-xs text-secondary-text">
              {t("payroll.fields.isMandatory")}
            </span>
          )}
        </div>
      ),
    },
    {
      dataIndex: "componentType",
      title: t("payroll.fields.componentType"),
      align: "center",
      width: 160,
      render: (_, record) => (
        <Tag
          className="m-0!"
          color={componentTypeColor[record.componentType] ?? "default"}
        >
          {t(`payroll.enums.componentType.${record.componentType}`, {
            defaultValue: record.componentTypeName ?? record.componentType,
          })}
        </Tag>
      ),
    },
    {
      dataIndex: "calculationMethod",
      title: t("payroll.fields.calculationMethod"),
      width: 190,
      render: (_, record) =>
        t(`payroll.enums.calculationMethod.${record.calculationMethod}`, {
          defaultValue: record.calculationMethodName ?? record.calculationMethod,
        }),
    },
    {
      dataIndex: "defaultAmount",
      title: t("payroll.fields.defaultValue"),
      align: "right",
      width: 150,
      render: (_, record) => {
        if (record.calculationMethod === "PERCENT_OF_GROSS") {
          return record.defaultRate != null ? `${record.defaultRate} %` : "—";
        }
        if (record.calculationMethod === "PER_HOUR") {
          return record.defaultRate != null
            ? `${numberSpacing(record.defaultRate)} / ${t("payroll.units.hour")}`
            : "—";
        }
        return record.defaultAmount != null
          ? numberSpacing(record.defaultAmount)
          : "—";
      },
    },
    {
      dataIndex: "effectiveFrom",
      title: t("payroll.fields.effectivePeriod"),
      align: "center",
      width: 190,
      render: (_, record) => (
        <span className="text-xs">
          {formatDate(record.effectiveFrom)} —{" "}
          {record.effectiveTo ? formatDate(record.effectiveTo) : "∞"}
        </span>
      ),
    },
    {
      dataIndex: "liabilityAccountId",
      title: t("payroll.fields.accounts"),
      width: 170,
      render: (_, record) => (
        <Tooltip
          title={
            <div className="flex flex-col gap-0.5">
              <span>
                {t("payroll.fields.expenseAccount")}:{" "}
                {record.expenseAccountName ?? "—"}
              </span>
              <span>
                {t("payroll.fields.liabilityAccount")}:{" "}
                {record.liabilityAccountName ?? "—"}
              </span>
            </div>
          }
        >
          <span className="line-clamp-2 text-xs text-secondary-text">
            {[record.expenseAccountName, record.liabilityAccountName]
              .filter(Boolean)
              .join(" / ") || "—"}
          </span>
        </Tooltip>
      ),
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const hasActions =
    permissions.includes(payrollComponentPermissions.update) ||
    permissions.includes(payrollComponentPermissions.delete);

  const tableColumns = hasActions
    ? [
        ...columns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center" as const,
          width: 90,
          fixed: "right" as const,
          render: (_: unknown, record: PayrollComponent) => (
            <ActionColumn
              deletePath={payrollComponentEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: payrollComponentPermissions.delete,
                editCode: payrollComponentPermissions.update,
              }}
              refetch={() => void refetch()}
              onDeleteSuccess={() =>
                queryClient.invalidateQueries({
                  queryKey: payrollComponentKeys.all,
                })
              }
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as PayrollComponent)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : columns;

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="componentType"
              placeholder="payroll.fields.componentType"
              options={componentTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              width={190}
            />
            <SelectFilter
              paramKey="stateId"
              placeholder="settings.fields.status"
              options={stateFilterOptions}
              width={150}
            />
          </>
        }
        actions={
          <PermissionCard permission={payrollComponentPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={openCreate}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<PayrollComponent>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={paginationProps(data?.total)}
          size="middle"
        />
      </Card>

      <PayrollComponentAddEditPage
        open={isFormOpen}
        id={editId}
        onClose={() => {
          setIsFormOpen(false);
          setEditId(null);
        }}
      />
    </div>
  );
}
