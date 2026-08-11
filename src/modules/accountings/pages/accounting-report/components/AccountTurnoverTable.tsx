import { Button, Checkbox, Empty, Popover, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileSpreadsheet, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Card from "@/components/ui/card/Card";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { numberSpacing } from "@/utils/utils";
import type {
  AccountTurnoverItem,
  AccountTurnoverQuery,
} from "../types/type";

interface Props {
  items: AccountTurnoverItem[];
  loading: boolean;
  filters: AccountTurnoverQuery;
}

const getExportDate = (value?: string | null) => value?.split("T")[0] ?? "all";

type FinancialColumnKey =
  | "openingDebit"
  | "openingCredit"
  | "periodDebit"
  | "periodCredit"
  | "closingDebit"
  | "closingCredit";

type VisibleColumnKey = FinancialColumnKey | "accountName";

const financialColumnKeys: FinancialColumnKey[] = [
  "openingDebit",
  "openingCredit",
  "periodDebit",
  "periodCredit",
  "closingDebit",
  "closingCredit",
];

export default function AccountTurnoverTable({
  items,
  loading,
  filters,
}: Props) {
  const { t } = useTranslation();
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumnKey[]>([
    "accountName",
    ...financialColumnKeys,
  ]);
  const visibleFinancialColumns = financialColumnKeys.filter((key) =>
    visibleColumns.includes(key),
  );

  const baseColumns = useMemo<ColumnsType<AccountTurnoverItem>>(
    () => [
      {
        title: t("common.rowNumber"),
        align: "center",
        width: 64,
        fixed: "left",
        render: (_value, _record, index) => index + 1,
      },
      {
        title: t("app.trial.accountCode"),
        dataIndex: "accountNumber",
        width: 130,
        fixed: "left",
        render: (value, record) => (
          <span className="font-medium text-text">
            {value || record.accountCode || "-"}
          </span>
        ),
      },
      ...(visibleColumns.includes("accountName")
        ? [
            {
              title: t("app.trial.accountName"),
              dataIndex: "accountName",
              width: 260,
              fixed: "left" as const,
            },
          ]
        : []),
    ],
    [t, visibleColumns],
  );

  const financialColumns = useMemo<
    Array<{
      key: FinancialColumnKey;
      label: string;
      column: ColumnsType<AccountTurnoverItem>[number];
    }>
  >(
    () => [
      {
        key: "openingDebit",
        label: t("app.trial.openingDebit"),
        column: {
          title: t("app.trial.openingDebit"),
          dataIndex: "openingDebit",
          align: "right",
          width: 170,
          render: (value) => (
            <span className="tabular-nums">
              {numberSpacing(value, undefined, true)}
            </span>
          ),
        },
      },
      {
        key: "openingCredit",
        label: t("app.trial.openingCredit"),
        column: {
          title: t("app.trial.openingCredit"),
          dataIndex: "openingCredit",
          align: "right",
          width: 170,
          render: (value) => (
            <span className="tabular-nums">
              {numberSpacing(value, undefined, true)}
            </span>
          ),
        },
      },
      {
        key: "periodDebit",
        label: t("app.trial.periodDebit"),
        column: {
          title: t("app.trial.periodDebit"),
          dataIndex: "periodDebit",
          align: "right",
          width: 160,
          render: (value) => (
            <span className="tabular-nums">
              {numberSpacing(value, undefined, true)}
            </span>
          ),
        },
      },
      {
        key: "periodCredit",
        label: t("app.trial.periodCredit"),
        column: {
          title: t("app.trial.periodCredit"),
          dataIndex: "periodCredit",
          align: "right",
          width: 160,
          render: (value) => (
            <span className="tabular-nums">
              {numberSpacing(value, undefined, true)}
            </span>
          ),
        },
      },
      {
        key: "closingDebit",
        label: t("app.trial.closingDebit"),
        column: {
          title: t("app.trial.closingDebit"),
          dataIndex: "closingDebit",
          align: "right",
          width: 170,
          render: (value) => (
            <span className="font-medium text-success tabular-nums">
              {numberSpacing(value, undefined, true)}
            </span>
          ),
        },
      },
      {
        key: "closingCredit",
        label: t("app.trial.closingCredit"),
        column: {
          title: t("app.trial.closingCredit"),
          dataIndex: "closingCredit",
          align: "right",
          width: 170,
          render: (value) => (
            <span className="font-medium text-warning tabular-nums">
              {numberSpacing(value, undefined, true)}
            </span>
          ),
        },
      },
    ],
    [t],
  );

  const columns = useMemo<ColumnsType<AccountTurnoverItem>>(
    () => [
      ...baseColumns,
      ...financialColumns
        .filter(({ key }) => visibleFinancialColumns.includes(key))
        .map(({ column }) => column),
    ],
    [baseColumns, financialColumns, visibleFinancialColumns],
  );

  const totals = useMemo(
    () =>
      items.reduce(
        (result, item) => ({
          openingDebit: result.openingDebit + item.openingDebit,
          openingCredit: result.openingCredit + item.openingCredit,
          periodDebit: result.periodDebit + item.periodDebit,
          periodCredit: result.periodCredit + item.periodCredit,
          closingDebit: result.closingDebit + item.closingDebit,
          closingCredit: result.closingCredit + item.closingCredit,
        }),
        {
          openingDebit: 0,
          openingCredit: 0,
          periodDebit: 0,
          periodCredit: 0,
          closingDebit: 0,
          closingCredit: 0,
        },
      ),
    [items],
  );

  const exportToExcel = () => {
    if (!items.length) return;

    const rows = items.map((item, index) => ({
      [t("common.rowNumber")]: index + 1,
      [t("app.trial.accountCode")]: item.accountNumber || item.accountCode || "",
      [t("app.trial.accountName")]: item.accountName,
      [t("app.trial.openingDebit")]: item.openingDebit,
      [t("app.trial.openingCredit")]: item.openingCredit,
      [t("app.trial.periodDebit")]: item.periodDebit,
      [t("app.trial.periodCredit")]: item.periodCredit,
      [t("app.trial.closingDebit")]: item.closingDebit,
      [t("app.trial.closingCredit")]: item.closingCredit,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Account turnover");
    XLSX.writeFile(
      book,
      `account-turnover-${getExportDate(filters.dateFrom)}-${getExportDate(filters.dateTo)}.xlsx`,
    );
  };

  const summaryValues = visibleFinancialColumns.map((key) => totals[key]);
  const baseColumnCount = visibleColumns.includes("accountName") ? 3 : 2;

  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-text">
          {t("app.reports.turnover.accountsCount", { count: items.length })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchFilter />
          <Popover
            trigger="click"
            placement="bottomRight"
            content={
              <Checkbox.Group
                value={visibleColumns}
                onChange={(values) => {
                  const nextValues = values as VisibleColumnKey[];
                  if (nextValues.length) setVisibleColumns(nextValues);
                }}
              >
                <div className="grid gap-2">
                  <Checkbox value="accountName">
                    {t("app.trial.accountName")}
                  </Checkbox>
                  {financialColumns.map(({ key, label }) => (
                    <Checkbox key={key} value={key}>
                      {label}
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
            disabled={!items.length}
            onClick={exportToExcel}
          >
            {t("app.reports.turnover.exportExcel")}
          </Button>
        </div>
      </div>

      <Table<AccountTurnoverItem>
        rowKey="accountId"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={false}
        size="middle"
        scroll={{ x: 1500, y: "calc(100vh - 430px)" }}
        locale={{
          emptyText: <Empty description={t("app.reports.turnover.empty")} />,
        }}
        summary={() =>
          items.length ? (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-surface-muted font-semibold">
                <Table.Summary.Cell index={0} colSpan={baseColumnCount}>
                  {t("common.total")} ({items.length})
                </Table.Summary.Cell>
                {summaryValues.map((value, index) => (
                  <Table.Summary.Cell
                    key={index}
                    index={index + baseColumnCount}
                    align="right"
                  >
                    <span className="tabular-nums">
                      {numberSpacing(value, undefined, true)}
                    </span>
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        }
      />
    </Card>
  );
}
