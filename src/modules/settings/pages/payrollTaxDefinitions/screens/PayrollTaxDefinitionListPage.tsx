import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ListPagination from "@/components/ui/table/ListPagination";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import {
  stateFilterOptions,
  taxTypeColor,
  taxTypeOptions,
} from "@/modules/payroll/constants/options";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { numberSpacing } from "@/utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { payrollTaxDefinitionEndpoints } from "../constants/endpoints";
import { payrollTaxDefinitionPermissions } from "../constants/permissions";
import { payrollTaxDefinitionKeys } from "../constants/queryKeys";
import { useGetListPayrollTaxDefinitions } from "../hooks";
import type { PayrollTaxDefinition } from "../types/type";
import PayrollTaxDefinitionAddEditPage from "./PayrollTaxDefinitionAddEditPage";

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format("DD.MM.YYYY") : "—";

export default function PayrollTaxDefinitionListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const queryClient = useQueryClient();
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListPayrollTaxDefinitions(searchParams);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const openCreate = () => {
    setEditId(null);
    setIsFormOpen(true);
  };

  const columns: TableColumnsType<PayrollTaxDefinition> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 45,
    },
    {
      dataIndex: "name",
      title: t("payroll.fields.taxName"),
      render: (value: string, record) => (
        <div className="flex flex-col">
          <span>{value}</span>
          <span className="text-xs text-secondary-text">{record.code}</span>
        </div>
      ),
    },
    {
      dataIndex: "taxType",
      title: t("payroll.fields.taxType"),
      align: "center",
      render: (_, record) => (
        <Tag className="m-0!" color={taxTypeColor[record.taxType] ?? "default"}>
          {t(`payroll.enums.taxType.${record.taxType}`, {
            defaultValue: record.taxType,
          })}
        </Tag>
      ),
    },
    {
      dataIndex: "baseType",
      title: t("payroll.fields.taxBaseType"),
      align: "center",
      render: (_, record) =>
        t(`payroll.enums.taxBaseType.${record.baseType}`, {
          defaultValue: record.baseType,
        }),
    },
    {
      dataIndex: "rate",
      title: t("payroll.fields.taxRate"),
      align: "center",
      render: (value: number) => `${value} %`,
    },
    {
      dataIndex: "exemptionAmount",
      title: t("payroll.fields.taxExemptionAmount"),
      align: "center",
      render: (value?: number | null) =>
        value != null ? numberSpacing(value) : "—",
    },
    {
      dataIndex: "limitAmount",
      title: t("payroll.fields.taxLimitAmount"),
      align: "center",
      render: (value?: number | null) =>
        value != null ? numberSpacing(value) : "—",
    },
    {
      dataIndex: "reducesTaxCode",
      title: t("payroll.fields.reducesTaxCode"),
      align: "center",
      render: (value?: string | null) =>
        value ? (
          <Tag className="m-0!" color="gold">
            {value}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "liabilityAccountNumber",
      title: t("payroll.fields.taxLiabilityAccount"),
      align: "center",
      render: (value?: string | null) => value ?? "—",
    },
    {
      dataIndex: "effectiveFrom",
      title: t("payroll.fields.effectivePeriod"),
      align: "center",
      render: (_, record) => (
        <span className="text-xs">
          {formatDate(record.effectiveFrom)} —{" "}
          {record.effectiveTo ? formatDate(record.effectiveTo) : "∞"}
        </span>
      ),
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => stateStatus(record.stateId),
    },
  ];

  const hasActions =
    permissions.includes(payrollTaxDefinitionPermissions.update) ||
    permissions.includes(payrollTaxDefinitionPermissions.delete);

  const tableColumns: TableColumnsType<PayrollTaxDefinition> = hasActions
    ? [
        ...columns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right" as const,
          render: (_: unknown, record: PayrollTaxDefinition) => (
            <ActionColumn
              deletePath={payrollTaxDefinitionEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: payrollTaxDefinitionPermissions.delete,
                editCode: payrollTaxDefinitionPermissions.update,
              }}
              refetch={() => void refetch()}
              onDeleteSuccess={() =>
                queryClient.invalidateQueries({
                  queryKey: payrollTaxDefinitionKeys.all,
                })
              }
              editModal={{
                isModal: true,
                setOpenEditModal: setIsFormOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as PayrollTaxDefinition)?.id ?? null),
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
              paramKey="taxType"
              placeholder="payroll.fields.taxType"
              options={taxTypeOptions.map((option) => ({
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
          <PermissionCard permission={payrollTaxDefinitionPermissions.create}>
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
        <Table<PayrollTaxDefinition>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={false}
          size="middle"
        />
        <ListPagination {...paginationProps(data?.total)} />
      </Card>

      <PayrollTaxDefinitionAddEditPage
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
