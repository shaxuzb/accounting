import { Button, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import dayjs from "@/config/dayjs";

const formatMoney = (value: number | null | undefined) =>
  typeof value === "number"
    ? new Intl.NumberFormat("uz-UZ", {
        maximumFractionDigits: 2,
      }).format(value)
    : "-";

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const date = dayjs(String(value));
  return date.isValid() ? date.format("DD.MM.YYYY HH:mm") : stringifyValue(value);
};

interface BankStatementCardProps {
  item: BankStatementCardData;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export default function BankStatementCard({
  item,
  expanded,
  onToggle,
  onDelete,
  onDeleteTransaction,
}: BankStatementCardProps) {
  const { t } = useTranslation();
  const totalDebit = item.transactions.reduce(
    (sum, transaction) => sum + (transaction.debit ?? 0),
    0,
  );
  const totalCredit = item.transactions.reduce(
    (sum, transaction) => sum + (transaction.credit ?? 0),
    0,
  );
  const totalAmount = item.transactions.reduce(
    (sum, transaction) => sum + (transaction.amount ?? 0),
    0,
  );
  const hasBankAccount = Boolean(item.bankAccountId);
  const dateFrom =
    item.dateFrom ??
    item.transactions.map((transaction) => transaction.docDate ?? transaction.date).find(Boolean);
  const dateTo =
    item.dateTo ??
    [...item.transactions]
      .reverse()
      .map((transaction) => transaction.docDate ?? transaction.date)
      .find(Boolean);

  const columns: ColumnsType<BankStatementTransaction> = [
    {
      title: t("bank.fields.date"),
      dataIndex: "date",
      width: 150,
      render: (_, record) => formatDate(record.docDate ?? record.date),
    },
    {
      title: t("bank.fields.accountNumber"),
      dataIndex: "counterpartyAccount",
      width: 180,
      render: (value) => stringifyValue(value),
    },
    {
      title: t("bank.fields.counterparty"),
      dataIndex: "counterpartyName",
      width: 200,
      render: (value) => stringifyValue(value),
    },
    {
      title: t("bank.fields.comment"),
      dataIndex: "purpose",
      width: 200,
      render: (_, record) => {
        const text = stringifyValue(record.comment ?? record.purpose);
        return (
          <Tooltip title={text}>
            <span className="line-clamp-2">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t("bank.fields.counterpartyId"),
      dataIndex: "counterpartyId",
      align: "center",
      width: 140,
      render: (value) => (
        <Tooltip title={!value ? t("bank.messages.counterpartyMissing") : undefined}>
          <span className={!value ? "font-semibold text-red-600" : ""}>
            {stringifyValue(value)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: t("bank.fields.debit"),
      dataIndex: "debit",
      align: "right",
      render: (value) => formatMoney(value),
    },
    {
      title: t("bank.fields.credit"),
      dataIndex: "credit",
      align: "right",
      render: (value) => formatMoney(value),
    },
    {
      title: t("bank.fields.amount"),
      dataIndex: "amount",
      align: "right",
      render: (value) => formatMoney(value),
    },
    {
      title: t("common.actions"),
      dataIndex: "actions",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<Trash2 className="size-4" />}
          onClick={() => onDeleteTransaction(record.id)}
        />
      ),
    },
  ];

  return (
    <Card
      className={clsx(
        "overflow-hidden border",
        hasBankAccount ? "border-border" : "border-red-300 bg-red-50/30",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          onClick={onToggle}
        >
          <span className="mt-1 text-gray-500">
            {expanded ? (
              <ChevronDown className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-gray-900">
              {item.title}
            </span>
            <span className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
              {item.fileName && <span>{item.fileName}</span>}
              <Tag color="blue">
                {item.transactions.length} {t("bank.import.transactions")}
              </Tag>
              <Tag color={hasBankAccount ? "green" : "red"}>
                {hasBankAccount
                  ? `${t("bank.fields.bankAccount")}: ${item.bankAccountId}`
                  : t("bank.messages.bankAccountMissing")}
              </Tag>
              {item.accountNumber && <Tag>{item.accountNumber}</Tag>}
            </span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <div className="text-xs text-gray-500">{t("bank.fields.date")}</div>
            <div className="font-semibold">
              {formatDate(dateFrom)}
              {dateTo && dateTo !== dateFrom ? ` - ${formatDate(dateTo)}` : ""}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">{t("bank.fields.currencyId")}</div>
            <div className="font-semibold">{item.currencyId ?? "-"}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">{t("bank.fields.operationType")}</div>
            <div className="font-semibold">{item.operationTypeId ?? "-"}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">{t("bank.fields.debit")}</div>
            <div className="font-semibold">{formatMoney(totalDebit)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">{t("bank.fields.credit")}</div>
            <div className="font-semibold">{formatMoney(totalCredit)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">{t("bank.fields.amount")}</div>
            <div className="font-semibold">{formatMoney(totalAmount)}</div>
          </div>
          <Button
            danger
            icon={<Trash2 className="size-4" />}
            onClick={onDelete}
          >
            {t("common.delete")}
          </Button>
        </div>
      </div>


      {expanded && (
        <div className="border-t border-border p-4">
          <Table<BankStatementTransaction>
            rowKey="id"
            columns={columns}
            dataSource={item.transactions}
            pagination={false}
            virtual={item.transactions.length > 50}
            scroll={{ x: "max-content", y: "calc(100vh - 200px)" }}
            rowClassName={(record) =>
              !record.counterpartyId
                ? "[&>td]:!bg-red-50 hover:[&>td]:!bg-red-100"
                : ""
            }
            locale={{ emptyText: t("bank.messages.noTransactions") }}
          />
        </div>
      )}
    </Card>
  );
}
