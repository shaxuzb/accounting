import { Button, Checkbox, Empty, Input, Popover, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileSpreadsheet, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Card from "@/components/ui/card/Card";
import {
  usePersistedState,
  useScopedStorageKey,
} from "@/shared/persistence/usePersistedState";
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

type VisibleColumnKey = FinancialColumnKey | "accountName";

const financialColumnKeys: FinancialColumnKey[] = [
  "openingDebit",
  "openingCredit",
  "periodDebit",
  "periodCredit",
  "closingDebit",
  "closingCredit",
];

const money = (value: number) => numberSpacing(value, undefined, true);

type TreeRow = TrialBalanceItem & { children?: TreeRow[] };
const exportDate = (value?: string | null) => value?.split("T")[0] ?? "all";

export default function TrialBalanceTable({ result, filters, loading }: Props) {
  const { t } = useTranslation();
  const searchKey = useScopedStorageKey("report-table", "trial-balance:search");
  const columnsKey = useScopedStorageKey(
    "report-table",
    "trial-balance:columns",
  );
  const [search, setSearch] = usePersistedState(searchKey, "", {
    storage: "session",
    debounceMs: 150,
  });
  const [visibleColumns, setVisibleColumns] = usePersistedState<
    VisibleColumnKey[]
  >(columnsKey, ["accountName", ...financialColumnKeys], {
    storage: "session",
    debounceMs: 0,
  });
  // 1C «Развернуть по субсчетам»: a group's subaccounts under it, all open at first
  const [collapsed, setCollapsed] = useState<number[] | null>(null);
  const visibleFinancialColumns = financialColumnKeys.filter((key) =>
    visibleColumns.includes(key),
  );

  const financialColumns = useMemo<
    Record<FinancialColumnKey, ColumnsType<TreeRow>[number]>
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

  const rows = useMemo(() => {
    const items = result?.items ?? [];
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return items;

    return items.filter((item) =>
      [item.accountNumber, item.accountName].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [result?.items, search]);

  // off-balance accounts stand after the totals and outside them, as in 1C
  const flatBalanceRows = rows.filter((item) => !item.isOffBalance);
  // the chart's hierarchy: a subaccount under its group (a search shows the matches flat)
  const balanceRows = useMemo<TreeRow[]>(() => {
    if (search.trim()) return flatBalanceRows;
    const present = new Set(flatBalanceRows.map((item) => item.accountId));
    const childrenOf = new Map<number, TreeRow[]>();
    for (const item of flatBalanceRows)
      if (item.parentAccountId && present.has(item.parentAccountId)) {
        const list = childrenOf.get(item.parentAccountId) ?? [];
        list.push({ ...item });
        childrenOf.set(item.parentAccountId, list);
      }
    const attach = (item: TreeRow): TreeRow => {
      const children = childrenOf.get(item.accountId);
      return children ? { ...item, children: children.map(attach) } : item;
    };
    return flatBalanceRows
      .filter((item) => !item.parentAccountId || !present.has(item.parentAccountId))
      .map(attach);
  }, [flatBalanceRows, search]);
  const groupIds = useMemo(
    () => flatBalanceRows.filter((item) => item.isGroup).map((item) => item.accountId),
    [flatBalanceRows],
  );
  const expandedKeys = groupIds.filter((id) => !(collapsed ?? []).includes(id));
  const rowNumbers = useMemo(() => {
    const numbers = new Map<number, number>();
    balanceRows.forEach((item, index) => numbers.set(item.accountId, index + 1));
    return numbers;
  }, [balanceRows]);

  const columns = useMemo<ColumnsType<TreeRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        align: "center",
        fixed: "left",
        width: 70,
        render: (_value, record) => (record.parentAccountId && !search.trim() ? "" : (rowNumbers.get(record.accountId) ?? "")),
      },
      {
        title: t("app.trial.accountCode"),
        dataIndex: "accountNumber",
        fixed: "left",
        width: 145,
        render: (value, record) => (
          <span className="font-medium text-text">
            {record.accountNumber || value || "-"}
          </span>
        ),
      },
      ...(visibleColumns.includes("accountName")
        ? [
            {
              title: t("app.trial.accountName"),
              dataIndex: "accountName",
              fixed: "left" as const,
              width: 260,
              render: (value: string) => value || "-",
            },
          ]
        : []),
      ...financialColumnKeys
        .filter((key) => visibleFinancialColumns.includes(key))
        .map((key) => financialColumns[key]),
    ],
    [financialColumns, t, visibleColumns, visibleFinancialColumns, search, rowNumbers],
  );

  const offBalanceRows = rows.filter((item) => item.isOffBalance);

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
  const baseColumnCount = visibleColumns.includes("accountName") ? 3 : 2;

  const exportToExcel = () => {
    if (!rows.length) return;

    const exportRows = rows.map((item) => ({
      [t("app.trial.accountNumber")]: item.accountNumber || item.accountName,
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
            {groupIds.length > 0 && !search.trim() && (
              <Button
                onClick={() =>
                  setCollapsed(expandedKeys.length > 0 ? groupIds : [])
                }
              >
                {t(expandedKeys.length > 0 ? "app.trial.collapseAll" : "app.trial.expandAll")}
              </Button>
            )}
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

      <Table<TreeRow>
        rowKey="accountId"
        loading={loading}
        columns={columns}
        dataSource={balanceRows}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpand: (expanded, record) =>
            setCollapsed((current) => {
              const list = current ?? [];
              return expanded
                ? list.filter((id) => id !== record.accountId)
                : [...list, record.accountId];
            }),
        }}
        rowClassName={(record) => (record.isGroup ? "bg-surface-muted font-semibold" : "")}
        size="middle"
        scroll={{ x: 1400 }}
        locale={{
          emptyText: <Empty description={t("app.trial.resultEmpty")} />,
        }}
        // the whole chart on one sheet, as 1C prints it
        pagination={false}
        summary={() =>
          result && rows.length ? (
            <>
            <Table.Summary.Row className="bg-surface-muted font-semibold">
              <Table.Summary.Cell index={0} colSpan={baseColumnCount}>
                {t("common.total")}
              </Table.Summary.Cell>
              {visibleTotalKeys.map((key, index) => (
                <Table.Summary.Cell
                  key={key}
                  index={index + baseColumnCount}
                  align="right"
                >
                  <span
                    className={`tabular-nums ${key.endsWith("Debit") ? "text-success" : "text-warning"}`}
                  >
                    {money(totals[key])}
                  </span>
                </Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
            {offBalanceRows.length > 0 && (
              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={0}
                  colSpan={baseColumnCount + visibleTotalKeys.length}
                >
                  <span className="text-secondary-text">{t("app.trial.offBalance")}</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            {offBalanceRows.map((item) => (
              <Table.Summary.Row
                key={item.accountId}
                className={item.isGroup ? "font-semibold" : undefined}
              >
                <Table.Summary.Cell index={0} colSpan={baseColumnCount}>
                  {item.accountNumber} {item.accountName}
                </Table.Summary.Cell>
                {visibleTotalKeys.map((key, index) => (
                  <Table.Summary.Cell
                    key={key}
                    index={index + baseColumnCount}
                    align="right"
                  >
                    <span className="tabular-nums">{item[key] ? money(item[key]) : ""}</span>
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            ))}
            </>
          ) : null
        }
      />
    </Card>
  );
}
