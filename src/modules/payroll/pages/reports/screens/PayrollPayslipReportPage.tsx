import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import SectionCard from "@/components/ui/card/SectionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import PayrollPeriodFilter from "@/modules/payroll/components/PayrollPeriodFilter";
import {
  componentTypeColor,
  type PayrollComponentType,
} from "@/modules/payroll/constants/options";
import { money } from "@/modules/payroll/utils/format";
import { Button, Empty, Spin, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import {
  Banknote,
  CalendarDays,
  Clock,
  HandCoins,
  Printer,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { useGetPayrollPayslip } from "../hooks";
import type { PayrollPayslipComponent } from "../types/type";

export default function PayrollPayslipReportPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodId = Number(searchParams.get("periodId")) || null;
  const employeeId = Number(searchParams.get("employeeId")) || null;

  const { data, isLoading, isFetching, refetch } = useGetPayrollPayslip(
    periodId,
    employeeId,
  );

  const setEmployee = (value: number | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set("employeeId", String(value));
    else nextParams.delete("employeeId");
    setSearchParams(nextParams, { replace: true });
  };

  const columns: TableColumnsType<PayrollPayslipComponent> = [
    {
      dataIndex: "code",
      title: t("payroll.fields.componentCode"),
      width: 120,
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "name",
      title: t("payroll.fields.componentName"),
      minWidth: 220,
      render: (value: string | null) => value ?? "—",
    },
    {
      dataIndex: "componentType",
      title: t("payroll.fields.componentType"),
      align: "center",
      width: 150,
      render: (value: PayrollComponentType | null) =>
        value ? (
          <Tag className="m-0!" color={componentTypeColor[value] ?? "default"}>
            {t(`payroll.enums.componentType.${value}`, { defaultValue: value })}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "baseAmount",
      title: t("payroll.fields.baseAmount"),
      align: "right",
      width: 150,
      render: (value: number | null) => money(value),
    },
    {
      dataIndex: "rate",
      title: t("payroll.fields.rate"),
      align: "center",
      width: 100,
      render: (value: number | null) => (value == null ? "—" : value),
    },
    {
      dataIndex: "amount",
      title: t("payroll.fields.amount"),
      align: "right",
      width: 170,
      render: (value: number, record) => (
        <span
          className={
            record.componentType === "DEDUCTION"
              ? "font-semibold text-red-500"
              : "font-semibold"
          }
        >
          {record.componentType === "DEDUCTION" ? "−" : ""}
          {money(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        filters={
          <>
            <PayrollPeriodFilter />
            <div className="w-64">
              <PayrollEmployeeSelect
                standalone
                value={employeeId}
                onChange={setEmployee}
              />
            </div>
          </>
        }
        actions={
          <Button
            icon={<Printer className="size-4" />}
            onClick={() => window.print()}
            disabled={!data}
          >
            {t("payroll.reports.print")}
          </Button>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      {!periodId || !employeeId ? (
        <Card className="border border-border p-10">
          <Empty description={t("payroll.reports.selectPeriodAndEmployee")} />
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center p-10">
          <Spin />
        </div>
      ) : !data ? (
        <Card className="border border-border p-10">
          <Empty description={t("payroll.reports.noData")} />
        </Card>
      ) : (
        <>
          <Card className="border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-secondary-text">
                  {t("payroll.reports.payslipTitle")}
                </div>
                <div className="mt-0.5 text-lg font-semibold text-text">
                  {data.employeeName ?? data.employeeId}
                </div>
                <div className="text-sm text-secondary-text">
                  {[
                    data.employeeNumber,
                    data.departmentName,
                    data.positionName,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
              <Tag className="m-0!" color="blue">
                {data.periodMonth
                  ? `${t(`payroll.months.${data.periodMonth}`, {
                      defaultValue: data.periodName ?? "",
                    })} ${data.periodYear ?? ""}`
                  : (data.periodName ?? "")}
              </Tag>
            </div>
          </Card>

          <DocumentSummary>
            <DocumentSummaryItem
              icon={<CalendarDays className="size-5" />}
              label={t("payroll.fields.workedDays")}
              value={`${data.workedDays ?? 0} / ${data.normWorkDays ?? "—"}`}
            />
            <DocumentSummaryItem
              icon={<Clock className="size-5" />}
              label={t("payroll.fields.workedHours")}
              value={`${data.workedHours ?? 0} / ${data.normWorkHours ?? "—"}`}
            />
            <DocumentSummaryItem
              icon={<Banknote className="size-5" />}
              label={t("payroll.fields.grossAmount")}
              value={`${money(data.grossAmount)} ${data.currencyName ?? ""}`}
            />
            <DocumentSummaryItem
              icon={<TrendingDown className="size-5" />}
              label={t("payroll.fields.deductionAmount")}
              value={money(data.deductionAmount)}
              iconClassName="text-red-500"
            />
            <DocumentSummaryItem
              icon={<Wallet className="size-5" />}
              label={t("payroll.fields.netAmount")}
              value={money(data.netAmount)}
              emphasized
            />
          </DocumentSummary>

          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <SectionCard
              title="payroll.reports.componentsTitle"
              description="payroll.reports.componentsHint"
              bodyClassName="p-0!"
            >
              <Table<PayrollPayslipComponent>
                columns={columns}
                dataSource={(data.components ?? []).map(
                  (component, index) => ({
                    ...component,
                    key: component.componentId ?? component.code ?? index,
                  }),
                )}
                pagination={false}
                size="middle"
                scroll={{ x: "max-content" }}
                locale={{
                  emptyText: <Empty description={t("payroll.reports.noData")} />,
                }}
              />
            </SectionCard>

            <SectionCard title="payroll.reports.totalsTitle">
              <dl className="space-y-3 text-sm">
                {[
                  ["payroll.fields.grossAmount", data.grossAmount],
                  ["payroll.fields.deductionAmount", data.deductionAmount],
                  ["payroll.fields.employerTaxAmount", data.employerTaxAmount],
                  ["payroll.fields.advanceAmount", data.advanceAmount ?? 0],
                  ["payroll.fields.netAmount", data.netAmount],
                  ["payroll.fields.paidAmount", data.paidAmount],
                ].map(([labelKey, value]) => (
                  <div
                    key={labelKey as string}
                    className="flex justify-between gap-3"
                  >
                    <dt className="text-secondary-text">
                      {t(labelKey as string)}
                    </dt>
                    <dd className="font-medium">{money(value as number)}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <dt className="flex items-center gap-2 font-medium">
                    <HandCoins className="size-4 text-primary" />
                    {t("payroll.fields.outstandingAmount")}
                  </dt>
                  <dd className="text-base font-semibold text-primary">
                    {money(data.outstandingAmount)}
                  </dd>
                </div>
              </dl>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
