import { Button, Checkbox, Empty, Input, Popover, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileSpreadsheet, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Card from "@/components/ui/card/Card";
import { customDate, numberSpacing } from "@/utils/utils";
import type {
  LedgerQuery,
  LedgerResult,
  LedgerTransaction,
} from "../types/type";

interface Props {
  result?: LedgerResult;
  filters?: LedgerQuery;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

type DetailColumnKey =
  | "journalNumber"
  | "documentType"
  | "description"
  | "currency"
  | "organization"
  | "counterparty";

const detailColumnKeys: DetailColumnKey[] = [
  "journalNumber",
  "documentType",
  "description",
  "currency",
  "organization",
  "counterparty",
];

const money = (value: number) => numberSpacing(value, undefined, true);
const exportDate = (value?: string | null) => value?.split("T")[0] ?? "all";

export default function LedgerTable({
  result,
  filters,
  loading,
  onPageChange,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [visibleDetails, setVisibleDetails] =
    useState<DetailColumnKey[]>(detailColumnKeys);

  const detailColumns = useMemo<
    Array<{
      key: DetailColumnKey;
      label: string;
      column: ColumnsType<LedgerTransaction>[number];
    }>
  >(
    () => [
      {
        key: "journalNumber",
        label: t("app.reports.fields.journalNumber"),
        column: {
          title: t("app.reports.fields.journalNumber"),
          dataIndex: "journalNumber",
          width: 160,
          render: (value) => value || "-",
        },
      },
      {
        key: "documentType",
        label: t("app.reports.fields.documentType"),
        column: {
          title: t("app.reports.fields.documentType"),
          dataIndex: "documentType",
          width: 200,
          render: (value) => value || "-",
        },
      },
      {
        key: "description",
        label: t("app.reports.fields.description"),
        column: {
          title: t("app.reports.fields.description"),
          dataIndex: "description",
          width: 230,
          render: (value) => value || "-",
        },
      },
      {
        key: "currency",
        label: t("app.reports.fields.currency"),
        column: {
          title: t("app.reports.fields.currency"),
          dataIndex: "currency",
          width: 90,
          render: (value) => value || "-",
        },
      },
      {
        key: "organization",
        label: t("app.reports.fields.organization"),
        column: {
          title: t("app.reports.fields.organization"),
          dataIndex: "organization",
          width: 180,
          render: (value) => value || "-",
        },
      },
      {
        key: "counterparty",
        label: t("app.reports.fields.counterparty"),
        column: {
          title: t("app.reports.fields.counterparty"),
          dataIndex: "counterparty",
          width: 240,
          render: (value) => value || "-",
        },
      },
    ],
    [t],
  );

  const columns = useMemo<ColumnsType<LedgerTransaction>>(
    () => {
      const visibleColumn = (keys: DetailColumnKey[]) =>
        detailColumns
          .filter(
            ({ key }) => keys.includes(key) && visibleDetails.includes(key),
          )
          .map(({ column }) => column);

      return [
        {
          title: t("app.reports.fields.postingDate"),
          dataIndex: "postingDate",
          fixed: "left",
          width: 155,
          render: (value) => customDate(value),
        },
        ...visibleColumn(["journalNumber", "documentType", "description"]),
        {
          title: t("openingBalance.fields.debit"),
          dataIndex: "debit",
          align: "right",
          width: 150,
          render: (value) => (
            <span className="font-medium text-brand-text tabular-nums">
              {money(value)}
            </span>
          ),
        },
        {
          title: t("openingBalance.fields.credit"),
          dataIndex: "credit",
          align: "right",
          width: 150,
          render: (value) => (
            <span className="font-medium text-warning tabular-nums">
              {money(value)}
            </span>
          ),
        },
        {
          title: t("app.reports.fields.runningBalance"),
          dataIndex: "runningBalance",
          align: "right",
          width: 170,
          render: (value) => (
            <span className="font-semibold text-success tabular-nums">
              {money(value)}
            </span>
          ),
        },
        ...visibleColumn(["currency", "organization", "counterparty"]),
      ];
    },
    [detailColumns, t, visibleDetails],
  );

  const rows = useMemo(() => {
    const items = result?.transactions ?? [];
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return items;

    return items.filter((item) =>
      [
        item.journalNumber,
        item.documentNumber,
        item.documentType,
        item.description,
        item.currency,
        item.organization,
        item.counterparty,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [result?.transactions, search]);

  const accountName = result
    ? [result.accountCode, result.accountName].filter(Boolean).join(" — ")
    : "";

  const exportToExcel = () => {
    if (!rows.length) return;

    const exportRows = rows.map((item, index) => ({
      [t("common.rowNumber")]: index + 1,
      [t("app.reports.fields.postingDate")]: customDate(item.postingDate),
      [t("app.reports.fields.journalNumber")]: item.journalNumber,
      [t("app.reports.fields.documentNumber")]: item.documentNumber,
      [t("app.reports.fields.documentType")]: item.documentType,
      [t("app.reports.fields.description")]: item.description,
      [t("openingBalance.fields.debit")]: item.debit,
      [t("openingBalance.fields.credit")]: item.credit,
      [t("app.reports.fields.runningBalance")]: item.runningBalance,
      [t("app.reports.fields.currency")]: item.currency,
      [t("app.reports.fields.organization")]: item.organization,
      [t("app.reports.fields.counterparty")]: item.counterparty,
    }));
    const sheet = XLSX.utils.json_to_sheet(exportRows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Ledger");
    XLSX.writeFile(
      book,
      `ledger-${exportDate(filters?.dateFrom)}-${exportDate(filters?.dateTo)}.xlsx`,
    );
  };

  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div className="text-base font-semibold text-text">
            {result
              ? `${accountName} — ${t("accountings.ledger.movements")}`
              : t("accountings.ledger.movements")}
          </div>
          {result && (
            <div className="text-xs text-secondary-text">
              {t("accountings.ledger.transactionsCount", {
                count: result.totalCount,
              })}
            </div>
          )}
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
                  value={visibleDetails}
                  onChange={(values) =>
                    setVisibleDetails(values as DetailColumnKey[])
                  }
                >
                  <div className="grid gap-2">
                    {detailColumns.map(({ key, label }) => (
                      <Checkbox key={key} value={key}>
                        {label}
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              }
            >
              <Button icon={<SlidersHorizontal className="size-4" />}>
                {t("accountings.ledger.columns")}
              </Button>
            </Popover>
            <Button
              icon={<FileSpreadsheet className="size-4 text-success" />}
              disabled={!rows.length}
              onClick={exportToExcel}
            >
              {t("accountings.ledger.exportExcel")}
            </Button>
          </div>
        </div>
      </div>

      <Table<LedgerTransaction>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        size="middle"
        scroll={{
          x: 1500,
          ...(rows.length > 10 ? { y: "calc(100vh - 430px)" } : {}),
        }}
        locale={{
          emptyText: (
            <Empty
              description={
                filters?.accountId
                  ? t("accountings.ledger.empty")
                  : t("accountings.ledger.selectAccount")
              }
            />
          ),
        }}
        pagination={
          result
            ? {
                current: result.page,
                pageSize: result.pageSize,
                total: result.totalCount,
                showSizeChanger: true,
                showTotal: (total) =>
                  t("accountings.ledger.transactionsCount", { count: total }),
                onChange: onPageChange,
              }
            : false
        }
      />
    </Card>
  );
}
