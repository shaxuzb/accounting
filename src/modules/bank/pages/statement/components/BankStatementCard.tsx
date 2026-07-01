import { Button, Select, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import { customDate, numberSpacing } from "@/utils/utils";

interface PaymentPurposeOption {
  id: number;
  name: string;
}

const stringifyValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

interface BankStatementCardProps {
  item: BankStatementCardData;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDeleteTransaction: (transactionIndex: number) => void;
  paymentPurposeLoading: boolean;
  onPaymentPurposeChange: (
    transactionIndex: number,
    paymentPurposeId: number | null,
  ) => void;
  getPaymentPurposeOptions: (
    transaction: BankStatementTransaction,
    transactionIndex: number,
  ) => PaymentPurposeOption[];
}

export default function BankStatementCard({
  item,
  expanded,
  onToggle,
  onDelete,
  onDeleteTransaction,
  paymentPurposeLoading,
  onPaymentPurposeChange,
  getPaymentPurposeOptions,
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
  const hasMissingCounterparty = item.transactions.some(
    (transaction) => !transaction.counterpartyId,
  );
  const hasMissingPaymentPurpose = item.transactions.some(
    (transaction) => !transaction.paymentPurposeId,
  );
  const dateFrom =
    item.dateFrom ??
    item.transactions.map((transaction) => transaction.date).find(Boolean);
  const dateTo =
    item.dateTo ??
    [...item.transactions]
      .reverse()
      .map((transaction) => transaction.date)
      .find(Boolean);

  const columns: ColumnsType<BankStatementTransaction> = [
    {
      title: t("bank.fields.date"),
      dataIndex: "date",
      width: 150,
      render: (_, record) => customDate(record.date),
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
      width: 300,
      render: (_, record) => {
        const text = stringifyValue(record.purpose);
        return (
          <Tooltip title={text}>
            <span className="line-clamp-2">{text}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "To'lov maqsadi",
      dataIndex: "paymentPurposeId",
      width: 220,
      render: (_, record, index) => (
        <Select
          showSearch
          value={record.paymentPurposeId || undefined}
          placeholder="To'lov maqsadini tanlang"
          loading={paymentPurposeLoading}
          options={getPaymentPurposeOptions(record, index).map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          allowClear
          onChange={(value) => {
            onPaymentPurposeChange(index, value ? Number(value) : null);
          }}
          onClear={() => onPaymentPurposeChange(index, null)}
          disabled={paymentPurposeLoading}
        />
      ),
    },
    // {
    //   title: t("bank.fields.counterpartyId"),
    //   dataIndex: "counterpartyId",
    //   align: "center",
    //   width: 140,
    //   render: (value) => (
    //     <Tooltip title={!value ? t("bank.messages.counterpartyMissing") : undefined}>
    //       <span className={!value ? "font-semibold text-red-600" : ""}>
    //         {stringifyValue(value)}
    //       </span>
    //     </Tooltip>
    //   ),
    // },
    {
      title: t("bank.fields.debit"),
      dataIndex: "debit",
      align: "right",
      render: (value) => numberSpacing(value),
    },
    {
      title: t("bank.fields.credit"),
      dataIndex: "credit",
      align: "right",
      render: (value) => numberSpacing(value),
    },
    {
      title: t("bank.fields.amount"),
      dataIndex: "amount",
      align: "right",
      render: (value) => numberSpacing(value),
    },
    {
      title: t("common.actions"),
      dataIndex: "actions",
      align: "center",
      fixed: "right",
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<Trash2 className="size-4" />}
          onClick={() => onDeleteTransaction(index)}
        />
      ),
    },
  ];

  return (
    <Card
      className={clsx(
        "overflow-hidden border",
        hasBankAccount && !hasMissingCounterparty && !hasMissingPaymentPurpose
          ? "border-border"
          : "border-red-300 bg-red-50/30",
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
            {hasMissingCounterparty && (
              <Tag color="red">{t("bank.messages.counterpartyMissing")}</Tag>
            )}
            {hasMissingPaymentPurpose && (
              <Tag color="red">To'lov maqsadi belgilanmagan</Tag>
            )}
            {item.accountNumber && <Tag>{item.accountNumber}</Tag>}
            </span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <div className="text-xs text-gray-500">{t("bank.fields.date")}</div>
            <div className="font-semibold">
              {customDate(dateFrom)}
              {dateTo && dateTo !== dateFrom ? ` - ${customDate(dateTo)}` : ""}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">
              {t("bank.fields.currencyId")}
            </div>
            <div className="font-semibold">{item.currencyId ?? "-"}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">
              {t("bank.fields.operationType")}
            </div>
            <div className="font-semibold">{item.operationTypeId ?? "-"}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">
              {t("bank.fields.debit")}
            </div>
            <div className="font-semibold">{numberSpacing(totalDebit)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">
              {t("bank.fields.credit")}
            </div>
            <div className="font-semibold">{numberSpacing(totalCredit)}</div>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
            <div className="text-xs text-gray-500">
              {t("bank.fields.amount")}
            </div>
            <div className="font-semibold">{numberSpacing(totalAmount)}</div>
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
            rowKey={(_, index) => `${item.id}-${index ?? 0}`}
            columns={columns}
            dataSource={item.transactions}
            pagination={false}
            virtual={item.transactions.length > 50}
            scroll={{ x: "max-content", y: "calc(100vh - 200px)" }}
            rowClassName={(record) =>
              !record.counterpartyId || !record.paymentPurposeId
                ? "[&_.ant-table-cell]:!bg-red-50 hover:[&_.ant-table-cell]:!bg-red-100"
                : ""
            }
            locale={{ emptyText: t("bank.messages.noTransactions") }}
          />
        </div>
      )}
    </Card>
  );
}
