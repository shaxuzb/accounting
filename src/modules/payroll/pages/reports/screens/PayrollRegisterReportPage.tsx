import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SectionCard from "@/components/ui/card/SectionCard";
import PayrollPeriodFilter from "@/modules/payroll/components/PayrollPeriodFilter";
import { money } from "@/modules/payroll/utils/format";
import { Button, Empty, Input, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  Banknote,
  Clock,
  FileSpreadsheet,
  HandCoins,
  Landmark,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import * as XLSX from "xlsx";
import { useGetPayrollRegister } from "../hooks";
import type { PayrollRegisterEmployee } from "../types/type";

export default function PayrollRegisterReportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const periodId = Number(searchParams.get("periodId")) || null;
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } =
    useGetPayrollRegister(periodId);

  const employees = useMemo(() => {
    const list = data?.employees ?? [];
    if (!search.trim()) return list;
    const query = search.trim().toLowerCase();
    return list.filter((employee) =>
      [employee.employeeName, employee.employeeNumber, employee.departmentName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data?.employees, search]);

  const exportToExcel = () => {
    if (!data) return;
    const rows = (data.employees ?? []).map((employee, index) => ({
      [t("common.rowNumber")]: index + 1,
      [t("payroll.fields.employeeNumber")]: employee.employeeNumber ?? "",
      [t("payroll.fields.employee")]: employee.employeeName ?? "",
      [t("payroll.fields.department")]: employee.departmentName ?? "",
      [t("payroll.fields.workedDays")]: employee.workedDays ?? 0,
      [t("payroll.fields.workedHours")]: employee.workedHours ?? 0,
      [t("payroll.fields.paidLeaveDays", { defaultValue: "Paid leave days" })]: employee.paidLeaveDays ?? 0,
      [t("payroll.fields.paidSickDays", { defaultValue: "Paid sick days" })]: employee.paidSickDays ?? 0,
      [t("payroll.fields.overtimeHours", { defaultValue: "Overtime hours" })]: employee.overtimeHours ?? 0,
      [t("payroll.fields.nightHours", { defaultValue: "Night hours" })]: employee.nightHours ?? 0,
      [t("payroll.fields.holidayHours", { defaultValue: "Holiday hours" })]: employee.holidayHours ?? 0,
      [t("payroll.fields.weekendHours", { defaultValue: "Weekend hours" })]: employee.weekendHours ?? 0,
      [t("payroll.fields.grossAmount")]: employee.grossAmount,
      [t("payroll.fields.deductionAmount")]: employee.deductionAmount,
      [t("payroll.fields.employerTaxAmount")]: employee.employerTaxAmount,
      [t("payroll.fields.netAmount")]: employee.netAmount,
      [t("payroll.fields.paidAmount")]: employee.paidAmount,
      [t("payroll.fields.outstandingAmount")]: employee.outstandingAmount,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Register");
    XLSX.writeFile(
      book,
      `payroll-register-${data.periodName ?? data.periodId}.xlsx`,
    );
  };

  const columns: TableColumnsType<PayrollRegisterEmployee> = [
    {
      dataIndex: "employeeName",
      title: t("payroll.fields.employee"),
      minWidth: 240,
      fixed: "left",
      render: (value: string | null, employee) => (
        <div className="flex flex-col">
          <Link
            to={`/main/payroll/reports/payslip?periodId=${periodId}&employeeId=${employee.employeeId}`}
            className="font-medium"
          >
            {value ?? employee.employeeId}
          </Link>
          <span className="text-xs text-secondary-text">
            {[employee.employeeNumber, employee.departmentName]
              .filter(Boolean)
              .join(" • ")}
          </span>
        </div>
      ),
    },
    {
      dataIndex: "workedDays",
      title: t("payroll.fields.workedDays"),
      align: "center",
      width: 110,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "workedHours",
      title: t("payroll.fields.workedHours"),
      align: "center",
      width: 120,
      render: (value: number | null) => value ?? "—",
    },
    {
      dataIndex: "paidLeaveDays",
      title: t("payroll.fields.paidLeaveDays", { defaultValue: "Paid leave days" }),
      align: "center",
      width: 130,
      render: (value: number | null) => value ?? 0,
    },
    {
      dataIndex: "paidSickDays",
      title: t("payroll.fields.paidSickDays", { defaultValue: "Paid sick days" }),
      align: "center",
      width: 130,
      render: (value: number | null) => value ?? 0,
    },
    {
      dataIndex: "overtimeHours",
      title: t("payroll.fields.overtimeHours", { defaultValue: "Overtime hours" }),
      align: "center",
      width: 130,
      render: (value: number | null) => value ?? 0,
    },
    {
      dataIndex: "nightHours",
      title: t("payroll.fields.nightHours", { defaultValue: "Night hours" }),
      align: "center",
      width: 120,
      render: (value: number | null) => value ?? 0,
    },
    {
      dataIndex: "holidayHours",
      title: t("payroll.fields.holidayHours", { defaultValue: "Holiday hours" }),
      align: "center",
      width: 130,
      render: (value: number | null) => value ?? 0,
    },
    {
      dataIndex: "weekendHours",
      title: t("payroll.fields.weekendHours", { defaultValue: "Weekend hours" }),
      align: "center",
      width: 130,
      render: (value: number | null) => value ?? 0,
    },
    {
      dataIndex: "grossAmount",
      title: t("payroll.fields.grossAmount"),
      align: "right",
      width: 150,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "correctionGrossAmount",
      title: t("payroll.fields.correctionGrossAmount"),
      align: "right",
      width: 160,
      render: (value: number | null) => money(value ?? 0),
    },
    {
      dataIndex: "deductionAmount",
      title: t("payroll.fields.deductionAmount"),
      align: "right",
      width: 150,
      render: (value: number) => (
        <span className="text-red-500">−{money(value)}</span>
      ),
    },
    {
      dataIndex: "employerTaxAmount",
      title: t("payroll.fields.employerTaxAmount"),
      align: "right",
      width: 160,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "netAmount",
      title: t("payroll.fields.netAmount"),
      align: "right",
      width: 150,
      render: (value: number) => (
        <span className="font-semibold">{money(value)}</span>
      ),
    },
    {
      dataIndex: "paidAmount",
      title: t("payroll.fields.paidAmount"),
      align: "right",
      width: 150,
      render: (value: number) => money(value),
    },
    {
      dataIndex: "outstandingAmount",
      title: t("payroll.fields.outstandingAmount"),
      align: "right",
      width: 160,
      fixed: "right",
      render: (value: number) => (
        <Tag className="m-0!" color={value > 0 ? "orange" : "green"}>
          {money(value)}
        </Tag>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        filters={
          <>
            <PayrollPeriodFilter />
            <Input.Search
              allowClear
              placeholder={t("payroll.placeholders.searchEmployee")}
              onChange={(event) => setSearch(event.target.value)}
              style={{ width: 240 }}
            />
          </>
        }
        actions={
          <Button
            icon={<FileSpreadsheet className="size-4" />}
            onClick={exportToExcel}
            disabled={!data?.employees?.length}
          >
            {t("payroll.reports.exportExcel")}
          </Button>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      {!periodId ? (
        <Card className="border border-border p-10">
          <Empty description={t("payroll.reports.selectPeriodFirst")} />
        </Card>
      ) : (
        <>
          <DocumentSummary>
            <DocumentSummaryItem
              icon={<Banknote className="size-5" />}
              label={t("payroll.fields.grossAmount")}
              value={`${money(data?.grossAmount)} ${data?.currencyName ?? ""}`}
            />
            <DocumentSummaryItem
              icon={<TrendingDown className="size-5" />}
              label={t("payroll.fields.deductionAmount")}
              value={money(data?.deductionAmount)}
              iconClassName="text-red-500"
            />
            <DocumentSummaryItem
              icon={<Landmark className="size-5" />}
              label={t("payroll.fields.employerTaxAmount")}
              value={money(data?.employerTaxAmount)}
            />
            <DocumentSummaryItem
              icon={<Wallet className="size-5" />}
              label={t("payroll.fields.netAmount")}
              value={money(data?.netAmount)}
              emphasized
            />
            <DocumentSummaryItem
              icon={<HandCoins className="size-5" />}
              label={t("payroll.fields.outstandingAmount")}
              value={money(data?.outstandingAmount)}
            />
            <DocumentSummaryItem
              icon={<Clock className="size-5" />}
              label={t("payroll.fields.overtimeHours", { defaultValue: "Overtime" })}
              value={`${data?.overtimeHours ?? 0} h`}
            />
          </DocumentSummary>

          <SectionCard
            bodyClassName="p-0!"
          >
            <Table<PayrollRegisterEmployee>
              loading={isLoading || isFetching}
              columns={columns}
              dataSource={employees.map((employee) => ({
                ...employee,
                key: employee.employeeId,
              }))}
              pagination={false}
              size="middle"
              scroll={{ x: "max-content", y: "calc(100vh - 460px)" }}
              locale={{
                emptyText: <Empty description={t("payroll.reports.noData")} />,
              }}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
