import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { usePayrollEmployeeLookup } from "@/modules/payroll/hooks/usePayrollEmployeeLookup";
import { useManualEntries } from "@/modules/accountings/pages/manual-entries/hooks";
import {
  manualEntryPermissions,
  manualEntryStatus,
  type ManualEntryListItem,
} from "@/modules/accountings/pages/manual-entries/types";
import { EXPENSE_REPORT_KIND, expenseReportsPath } from "./constants";

const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Expense reports of accountable persons (1C «Авансовые отчеты»). */
export default function ExpenseReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data = [], isLoading, isFetching, refetch } = useManualEntries({
    kind: EXPENSE_REPORT_KIND,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
  });
  const { data: employees = [] } = usePayrollEmployeeLookup();
  const employeeNames = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee.label])),
    [employees],
  );

  const columns: TableColumnsType<ManualEntryListItem> = [
    { dataIndex: "docNumber", title: "№", width: 110 },
    {
      dataIndex: "docDate",
      title: t("manualEntries.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      dataIndex: "employeeId",
      title: t("expenseReport.employee"),
      render: (value?: number | null) => (value ? employeeNames.get(value) ?? value : "-"),
    },
    { dataIndex: "comment", title: t("manualEntries.comment") },
    {
      dataIndex: "totalAmount",
      title: t("manualEntries.amount"),
      align: "right",
      render: (value: number) => money(value),
    },
    {
      dataIndex: "statusId",
      title: t("currency.status.title"),
      align: "center",
      render: (value: number) =>
        value === manualEntryStatus.posted ? (
          <Tag color="green">{t("currency.status.posted")}</Tag>
        ) : value === manualEntryStatus.cancelled ? (
          <Tag color="red">{t("currency.status.cancelled")}</Tag>
        ) : (
          <Tag>{t("currency.status.draft")}</Tag>
        ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />
          </>
        }
        actions={
          <PermissionCard permission={manualEntryPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate(`${expenseReportsPath}/new`)}
            >
              {t("expenseReport.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<ManualEntryListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${expenseReportsPath}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
