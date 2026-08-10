import { Button, Checkbox, Empty, Input, Popover, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileSpreadsheet, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Card from "@/components/ui/card/Card";
import { numberSpacing } from "@/utils/utils";
import type {
  TrialBalanceItem,
  TrialBalanceQuery,
  TrialBalanceResult,
} from "../types/type";

interface Props {
  result?: TrialBalanceResult;
  filters: TrialBalanceQuery;
  loading: boolean;
}

type FinancialColumnKey =
  | "openingDebit"
  | "openingCredit"
  | "periodDebit"
  | "periodCredit"
  | "closingDebit"
  | "closingCredit";

const financialColumnKeys: FinancialColumnKey[] = [
  "openingDebit",
  "openingCredit",
  "periodDebit",
  "periodCredit",
  "closingDebit",
  "closingCredit",
];

const money = (value: number) => numberSpacing(value, undefined, true);
const exportDate = (value?: string | null) => value?.split("T")[0] ?? "all";

export default function TrialBalanceTable({ result, filters, loading }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [visibleFinancialColumns, setVisibleFinancialColumns] =
    useState<FinancialColumnKey[]>(financialColumnKeys);

  const financialColumns = useMemo<
    Record<FinancialColumnKey, ColumnsType<TrialBalanceItem>[number]>
  >(
    () => ({
      openingDebit: {
        title: (
          <span className="text-success">{t("app.trial.openingDebit")}</span>
        ),
        dataIndex: "openingDebit",
        align: "right",
        width: 155,
        render: (value) => (
          <span className="text-success tabular-nums">{money(value)}</span>
        ),
      },
      openingCredit: {
        title: (
          <span className="text-warning">{t("app.trial.openingCredit")}</span>
        ),
        dataIndex: "openingCredit",
        align: "right",
        width: 155,
        render: (value) => (
          <span className="text-warning tabular-nums">{money(value)}</span>
        ),
      },
      periodDebit: {
        title: (
          <span className="text-success">{t("app.trial.periodDebit")}</span>
        ),
        dataIndex: "periodDebit",
        align: "right",
        width: 165,
        render: (value) => (
          <span className="text-success tabular-nums">{money(value)}</span>
        ),
      },
      periodCredit: {
        title: (
          <span className="text-warning">{t("app.trial.periodCredit")}</span>
        ),
        dataIndex: "periodCredit",
        align: "right",
        width: 165,
        render: (value) => (
          <span className="text-warning tabular-nums">{money(value)}</span>
        ),
      },
      closingDebit: {
        title: (
          <span className="text-success">{t("app.trial.closingDebit")}</span>
        ),
        dataIndex: "closingDebit",
        align: "right",
        width: 165,
        render: (value) => (
          <span className="font-medium text-success tabular-nums">
            {money(value)}
          </span>
        ),
      },
      closingCredit: {
        title: (
          <span className="text-warning">{t("app.trial.closingCredit")}</span>
        ),
        dataIndex: "closingCredit",
        align: "right",
        width: 165,
        render: (value) => (
          <span className="font-medium text-warning tabular-nums">
            {money(value)}
          </span>
        ),
      },
    }),
    [t],
  );

  const columns = useMemo<ColumnsType<TrialBalanceItem>>(
    () => [
      {
        title: t("common.rowNumber"),
        align: "center",
        fixed: "left",
        width: 70,
        render: (_value, _record, index) => index + 1,
      },
      {
        title: t("app.trial.accountCode"),
        dataIndex: "accountCode",
        fixed: "left",
        width: 145,
        render: (value,record) => (
          <span className="font-medium text-text">
            {record.accountCode || "-" || value}
          </span>
        ),
      },
      {
        title: t("app.trial.accountName"),
        dataIndex: "accountName",
        fixed: "left",
        width: 260,
        render: (value) => value || "-",
      },
      ...financialColumnKeys
        .filter((key) => visibleFinancialColumns.includes(key))
        .map((key) => financialColumns[key]),
    ],
    [financialColumns, t, visibleFinancialColumns],
  );

  const rows = useMemo(() => {
    const items = result?.items ?? [];
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return items;

    return items.filter((item) =>
      [item.accountCode, item.accountName].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [result?.items, search]);

  const totals: Record<FinancialColumnKey, number> = {
    openingDebit: result?.openingDebitTotal ?? 0,
    openingCredit: result?.openingCreditTotal ?? 0,
    periodDebit: result?.periodDebitTotal ?? 0,
    periodCredit: result?.periodCreditTotal ?? 0,
    closingDebit: result?.closingDebitTotal ?? 0,
    closingCredit: result?.closingCreditTotal ?? 0,
  };
  const visibleTotalKeys = financialColumnKeys.filter((key) =>
    visibleFinancialColumns.includes(key),
  );

  const exportToExcel = () => {
    if (!rows.length) return;

    const exportRows = rows.map((item) => ({
      [t("app.trial.accountCode")]: item.accountCode || item.accountName,
      [t("app.trial.accountName")]: item.accountName,
      [t("app.trial.openingDebit")]: item.openingDebit,
      [t("app.trial.openingCredit")]: item.openingCredit,
      [t("app.trial.periodDebit")]: item.periodDebit,
      [t("app.trial.periodCredit")]: item.periodCredit,
      [t("app.trial.closingDebit")]: item.closingDebit,
      [t("app.trial.closingCredit")]: item.closingCredit,
    }));
    const sheet = XLSX.utils.json_to_sheet(exportRows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Trial balance");
    XLSX.writeFile(
      book,
      `trial-balance-${exportDate(filters.dateFrom)}-${exportDate(filters.dateTo)}.xlsx`,
    );
  };

  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div className="text-base font-semibold text-text">
            {t("app.accounting.trialBalance")}
          </div>
          <div className="text-xs text-secondary-text">
            {t("app.reports.turnover.accountsCount", { count: rows.length })}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
          <Input
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            prefix={<Search className="size-4 text-secondary-text" />}
            placeholder={t("common.search")}
            className="w-full! sm:w-64!"
          />
          <div className="flex items-center gap-2">
            <Popover
              trigger="click"
              placement="bottomRight"
              content={
                <Checkbox.Group
                  value={visibleFinancialColumns}
                  onChange={(values) => {
                    const nextValues = values as FinancialColumnKey[];
                    if (nextValues.length)
                      setVisibleFinancialColumns(nextValues);
                  }}
                >
                  <div className="grid gap-2">
                    {financialColumnKeys.map((key) => (
                      <Checkbox key={key} value={key}>
                        {t(`app.trial.${key}`)}
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              }
            >
              <Button icon={<SlidersHorizontal className="size-4" />}>
                {t("app.reports.turnover.columns")}
              </Button>
            </Popover>
            <Button
              icon={<FileSpreadsheet className="size-4 text-success" />}
              disabled={!rows.length}
              onClick={exportToExcel}
            >
              {t("app.reports.turnover.exportExcel")}
            </Button>
          </div>
        </div>
      </div>

      <Table<TrialBalanceItem>
        rowKey="accountId"
        loading={loading}
        columns={columns}
        dataSource={rows}
        size="middle"
        scroll={{ x: 1400 }}
        locale={{
          emptyText: <Empty description={t("app.trial.resultEmpty")} />,
        }}
        pagination={
          rows.length > 10
            ? {
                defaultPageSize: 10,
                showSizeChanger: true,
                showTotal: (total) =>
                  t("app.reports.turnover.accountsCount", { count: total }),
              }
            : false
        }
        summary={() =>
          result && rows.length ? (
            <Table.Summary.Row className="bg-surface-muted font-semibold">
              <Table.Summary.Cell index={0} colSpan={3}>
                {t("common.total")}
              </Table.Summary.Cell>
              {visibleTotalKeys.map((key, index) => (
                <Table.Summary.Cell key={key} index={index + 3} align="right">
                  <span
                    className={`tabular-nums ${key.endsWith("Debit") ? "text-success" : "text-warning"}`}
                  >
                    {money(totals[key])}
                  </span>
                </Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
          ) : null
        }
      />
    </Card>
  );
}
