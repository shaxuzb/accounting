import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import PayrollPeriodFilter from "@/modules/payroll/components/PayrollPeriodFilter";
import { documentStatusFilterOptions } from "@/modules/payroll/constants/options";
import { payrollTimesheetPermissions } from "@/modules/payroll/constants/permissions";
import { displayDate } from "@/modules/payroll/utils/format";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { useAppSelector } from "@/store/hooks";
import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { payrollTimesheetEndpoints } from "../constants/endpoints";
import { useGetPayrollTimesheets } from "../hooks";
import type { PayrollTimesheet } from "../types/type";

const LIST_PATH = "/main/payroll/timesheets";

export default function PayrollTimesheetListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { withRowNumbers, paginationProps } = usePaginationParams();
  const { data, isLoading, isFetching, refetch } =
    useGetPayrollTimesheets(searchParams);

  const columns: TableColumnsType<PayrollTimesheet> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "docNumber",
      title: t("payroll.fields.docNumber"),
      width: 150,
      render: (value: string | null, record) => (
        <Link to={`${LIST_PATH}/${record.id}`} className="font-medium">
          {value ?? record.id}
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("payroll.fields.docDate"),
      align: "center",
      width: 130,
      render: (value: string) => displayDate(value),
    },
    {
      dataIndex: "periodId",
      title: t("payroll.fields.period"),
      width: 170,
      render: (_, record) =>
        record.periodMonth
          ? `${t(`payroll.months.${record.periodMonth}`, {
              defaultValue: record.periodName ?? "",
            })} ${record.periodYear ?? ""}`
          : (record.periodName ?? "—"),
    },
    {
      dataIndex: "employeeCount",
      title: t("payroll.fields.employeeCount"),
      align: "center",
      width: 130,
      render: (value: number | null, record) =>
        value ?? record.lines?.length ?? "—",
    },
    {
      dataIndex: "totalWorkedDays",
      title: t("payroll.fields.totalWorkedDays"),
      align: "center",
      width: 140,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "totalWorkedHours",
      title: t("payroll.fields.totalWorkedHours"),
      align: "center",
      width: 150,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "note",
      title: t("payroll.fields.note"),
      minWidth: 160,
      render: (value: string | null) => (
        <span className="line-clamp-2">{value ?? "—"}</span>
      ),
    },
    {
      dataIndex: "statusId",
      title: t("settings.fields.status"),
      align: "center",
      width: 150,
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
    },
  ];

  const hasActions = permissions.includes(payrollTimesheetPermissions.update);
  const tableColumns = hasActions
    ? [
        ...columns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center" as const,
          width: 90,
          fixed: "right" as const,
          render: (_: unknown, record: PayrollTimesheet) => (
            <ActionColumn
              deletePath={payrollTimesheetEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode:
                  record.statusId === 1
                    ? payrollTimesheetPermissions.update
                    : "",
              }}
              refetch={() => void refetch()}
              customPath={`${LIST_PATH}/${record.id}`}
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
            <PayrollPeriodFilter />
            <SelectFilter
              paramKey="statusId"
              placeholder="settings.fields.status"
              options={documentStatusFilterOptions}
              width={170}
            />
          </>
        }
        actions={
          <PermissionCard permission={payrollTimesheetPermissions.create}>
            <Link to={`${LIST_PATH}/add`}>
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("payroll.timesheets.create")}
              </Button>
            </Link>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<PayrollTimesheet>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={withRowNumbers(data?.items)}
          scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
          pagination={paginationProps(data?.total)}
          size="middle"
        />
      </Card>
    </div>
  );
}
