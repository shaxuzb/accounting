import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { Alert, Button, Empty, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import { formatDate, numberSpacing } from "@/utils/utils";
import {
  counterpartyRegisterOperationTypeId,
  reportManualEndpoints,
} from "../constants/endpoints";
import { counterpartyOperationTypeOptions } from "../constants/options";
import type { OperationalReportKey } from "../constants/permissions";
import { useCounterpartyNames, useOperationalReportList } from "../hooks";
import type {
  CounterpartyBalanceReportRow,
  CounterpartyBalanceSummary,
} from "../types/type";
import ReportExportButton from "./ReportExportButton";
import ReportSummaryBar from "./ReportSummaryBar";

/**
 * Registrni kontragent kesimida yig'ish uchun hamma satr kerak, shuning uchun
 * sahifalash o'rniga bitta katta so'rov yuboriladi. Chegaradan oshsa,
 * foydalanuvchiga ogohlantirish chiqadi: jim qirqilgan hisobot noto'g'ri
 * qarorga olib keladi.
 */
const AGGREGATION_PAGE_SIZE = 2000;

interface CounterpartyBalanceReportProps {
  report: Extract<OperationalReportKey, "receivable" | "payable">;
  exportPermission: string;
  /** CounterpartySettlementKindConst: 1 - debitor, 2 - kreditor. */
  settlementKindId: number;
  /** Saldo ustuni sarlavhasi. */
  balanceLabelKey: string;
  /** Qaysi hujjat turi yig'ilayotgani sahifada ochiq yozilsin. */
  scopeNoteKey: string;
}

export default function CounterpartyBalanceReport({
  report,
  exportPermission,
  settlementKindId,
  balanceLabelKey,
  scopeNoteKey,
}: CounterpartyBalanceReportProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const counterpartyNames = useCounterpartyNames();

  const requestParams = useMemo(
    () => ({
      ...Object.fromEntries(searchParams),
      settlementKindId,
      page: 1,
      pageSize: AGGREGATION_PAGE_SIZE,
    }),
    [searchParams, settlementKindId],
  );

  const { data, isError, isLoading, isFetching, refetch } =
    useOperationalReportList<CounterpartyBalanceReportRow>(
      report,
      requestParams,
    );

  const rows = useMemo(() => data?.items ?? [], [data]);
  const totalCount = data?.totalCount ?? 0;
  const isTruncated = totalCount > rows.length;

  const resolveName = counterpartyNames.resolve;

  const summaries = useMemo<CounterpartyBalanceSummary[]>(() => {
    const byCounterparty = new Map<number, CounterpartyBalanceSummary>();

    for (const row of rows) {
      const existing: CounterpartyBalanceSummary = byCounterparty.get(
        row.counterpartyId,
      ) ?? {
        counterpartyId: row.counterpartyId,
        counterpartyName: resolveName(row.counterpartyId),
        increase: 0,
        decrease: 0,
        balance: 0,
        movements: 0,
        lastDocDate: null,
      };

      if (
        row.operationTypeId ===
        counterpartyRegisterOperationTypeId.debtIncrease
      ) {
        existing.increase += row.amount;
      } else {
        existing.decrease += row.amount;
      }

      existing.movements += 1;
      existing.balance = existing.increase - existing.decrease;
      if (!existing.lastDocDate || row.docDate > existing.lastDocDate) {
        existing.lastDocDate = row.docDate;
      }

      byCounterparty.set(row.counterpartyId, existing);
    }

    return [...byCounterparty.values()].sort((a, b) => b.balance - a.balance);
  }, [rows, resolveName]);

  const totals = summaries.reduce(
    (acc, item) => ({
      increase: acc.increase + item.increase,
      decrease: acc.decrease + item.decrease,
      balance: acc.balance + item.balance,
    }),
    { increase: 0, decrease: 0, balance: 0 },
  );

  const columns: TableColumnsType<CounterpartyBalanceSummary> = [
    {
      dataIndex: "counterpartyName",
      title: t("reports.fields.counterparty"),
    },
    {
      dataIndex: "increase",
      title: t("reports.fields.debtIncrease"),
      align: "right",
      render: (value: number) => (
        <span className="whitespace-nowrap tabular-nums">
          {numberSpacing(value, undefined, true)}
        </span>
      ),
    },
    {
      dataIndex: "decrease",
      title: t("reports.fields.debtDecrease"),
      align: "right",
      render: (value: number) => (
        <span className="whitespace-nowrap tabular-nums">
          {numberSpacing(value, undefined, true)}
        </span>
      ),
    },
    {
      dataIndex: "balance",
      title: t(balanceLabelKey),
      align: "right",
      sorter: (a, b) => a.balance - b.balance,
      render: (value: number) => (
        <span
          className={`whitespace-nowrap font-semibold tabular-nums ${
            value > 0
              ? "text-red-600 dark:text-red-400"
              : value < 0
                ? "text-emerald-600 dark:text-emerald-400"
                : ""
          }`}
        >
          {numberSpacing(value, undefined, true)}
        </span>
      ),
    },
    {
      dataIndex: "movements",
      title: t("reports.fields.movements"),
      align: "center",
      render: (value: number) => <Tag>{value}</Tag>,
    },
    {
      dataIndex: "lastDocDate",
      title: t("reports.fields.lastOperation"),
      render: (value: string | null) =>
        value ? formatDate(value, "DD.MM.YYYY") : "-",
    },
  ];

  // Ochilgan jadval ota jadvalning keng ustunlarini meros qilib olmasligi uchun
  // enlar aniq belgilanadi — aks holda summa o'ng chetga chiqib ketadi.
  const movementColumns: TableColumnsType<CounterpartyBalanceReportRow> = [
    {
      dataIndex: "docDate",
      title: t("reports.fields.docDate"),
      width: 120,
      render: (value) => formatDate(value, "DD.MM.YYYY"),
    },
    {
      dataIndex: "documentId",
      title: t("reports.fields.documentId"),
      width: 110,
      align: "center",
    },
    {
      dataIndex: "operationTypeId",
      title: t("reports.fields.operationType"),
      width: 160,
      render: (value: number) =>
        value === counterpartyRegisterOperationTypeId.debtIncrease
          ? t("reports.filters.debtIncrease")
          : t("reports.filters.debtDecrease"),
    },
    {
      dataIndex: "amount",
      title: t("reports.fields.amount"),
      width: 180,
      align: "right",
      render: (value: number) => (
        <span className="whitespace-nowrap tabular-nums">
          {numberSpacing(value, undefined, true)}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SelectFilter
              paramKey="counterpartyId"
              placeholder="reports.fields.counterparty"
              path={reportManualEndpoints.counterparties}
              search
              width={240}
            />
            <SelectFilter
              paramKey="operationTypeId"
              placeholder="reports.fields.operationType"
              options={counterpartyOperationTypeOptions}
              width={190}
            />
            <DateRangeFilter
              placeholderKeys={[
                "reports.fields.dateFrom",
                "reports.fields.dateTo",
              ]}
            />
          </>
        }
        actions={
          <ReportExportButton
            report={report}
            permission={exportPermission}
            params={requestParams}
            disabled={totalCount === 0}
          />
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />

      <ReportSummaryBar
        items={[
          {
            labelKey: "reports.summary.counterpartyCount",
            value: summaries.length,
          },
          { labelKey: "reports.fields.debtIncrease", value: totals.increase },
          { labelKey: "reports.fields.debtDecrease", value: totals.decrease },
          { labelKey: balanceLabelKey, value: totals.balance },
        ]}
        scopeNote={t(scopeNoteKey)}
      />

      {isTruncated && (
        <Alert
          showIcon
          type="warning"
          className="mb-3"
          message={t("reports.messages.aggregationTruncated", {
            loaded: rows.length,
            total: totalCount,
          })}
        />
      )}

      <Card className="overflow-hidden border border-border">
        {isError && (
          <Alert
            showIcon
            type="error"
            className="m-3"
            message={t("reports.messages.loadError")}
            action={
              <Button size="small" onClick={() => void refetch()}>
                {t("reports.actions.retry")}
              </Button>
            }
          />
        )}
        <Table
          loading={isLoading || isFetching || counterpartyNames.isLoading}
          columns={columns}
          dataSource={summaries}
          rowKey="counterpartyId"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("reports.messages.empty")}
              />
            ),
          }}
          expandable={{
            expandedRowRender: (record) => (
              // Ota jadval `max-content` kengligida yoyilgan, ichki jadval esa
              // uni meros qilib oladi: cheklamasak, summa ham, sahifalagich ham
              // ekrandan tashqariga chiqib ketadi.
              <div className="max-w-[640px]">
                <Table
                  size="small"
                  columns={movementColumns}
                  dataSource={rows
                    .filter(
                      (row) => row.counterpartyId === record.counterpartyId,
                    )
                    .slice()
                    .sort((a, b) => a.docDate.localeCompare(b.docDate))}
                  rowKey="id"
                  // Bitta kontragentda yuzlab harakat bo'lishi mumkin: hammasini
                  // ochib yuborish qolgan kontragentlarni ekrandan siqib
                  // chiqaradi.
                  pagination={{
                    pageSize: 8,
                    size: "small",
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                  }}
                />
              </div>
            ),
          }}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
        />
      </Card>
    </div>
  );
}
