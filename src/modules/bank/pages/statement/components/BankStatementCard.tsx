import { Button, Select, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import clsx from "clsx";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import type {
  BankChartAccountOption,
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
} from "@/shared/constants/selectLists";
import { customDate, numberSpacing } from "@/utils/utils";
import BankTransactionContractSelect from "./BankTransactionContractSelect";
import BankTransactionCounterpartyAccountSelect from "./BankTransactionCounterpartyAccountSelect";
import BankTransactionOffsetAccountSelect from "./BankTransactionOffsetAccountSelect";

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
  chartAccountLoading: boolean;
  bankAccountOptionsByDocumentType: Record<number, BankChartAccountOption[]>;
  offsetAccountOptionsByDocumentType: Record<number, BankChartAccountOption[]>;
  onBankChartAccountChange: (bankChartAccountId: number | null) => void;
  onOffsetAccountChange: (
    transactionIndex: number,
    offsetAccountId: number | null,
  ) => void;
  onContractChange: (
    transactionIndex: number,
    contractId: number | null,
  ) => void;
  onAddContract: (
    transactionIndex: number,
    transaction: BankStatementTransaction,
  ) => void;
  onCounterpartyBankAccountChange: (
    transactionIndex: number,
    accountId: number | null,
  ) => void;
  onAddCounterpartyBankAccount: (
    transactionIndex: number,
    transaction: BankStatementTransaction,
  ) => void;
}

function BankStatementCard({
  item,
  expanded,
  onToggle,
  onDelete,
  onDeleteTransaction,
  chartAccountLoading,
  bankAccountOptionsByDocumentType,
  offsetAccountOptionsByDocumentType,
  onBankChartAccountChange,
  onOffsetAccountChange,
  onContractChange,
  onAddContract,
  onCounterpartyBankAccountChange,
  onAddCounterpartyBankAccount,
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
  const hasBankChartAccount = Boolean(item.bankChartAccountId);
  const hasMissingOffsetAccount = item.transactions.some(
    (transaction) => !transaction.offsetAccountId,
  );
  const hasMissingContract = item.transactions.some(
    (transaction) => !transaction.contractId,
  );
  const hasMissingCounterpartyBankAccount = item.transactions.some(
    (transaction) => !transaction.counterpartyBankAccountId,
  );
  const getDocumentTypeId = (operationTypeId: unknown) =>
    Number(operationTypeId) === 2 ? 6 : 5;
  const itemOperationTypeId =
    item.operationTypeId ||
    item.transactions.find((transaction) => transaction.operationTypeId)
      ?.operationTypeId;
  const itemDocumentTypeId = getDocumentTypeId(itemOperationTypeId);
  const bankAccountOptions =
    bankAccountOptionsByDocumentType[itemDocumentTypeId] ?? [];
  const getTransactionDocumentTypeId = (
    transaction: BankStatementTransaction,
  ) => getDocumentTypeId(transaction.operationTypeId || item.operationTypeId);
  const getSelectedLabel = (
    value: unknown,
    options: BankChartAccountOption[],
  ) => {
    const option = options.find((item) => item.id === Number(value));
    return option ? chartAccountSelectedLabel(option) : undefined;
  };
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
      title: t("settings.fields.accountNumber"),
      dataIndex: "counterpartyBankAccountId",
      width: 240,
      render: (_, record, index) => (
        <BankTransactionCounterpartyAccountSelect
          counterpartyId={record.counterpartyId}
          importedAccountNumber={record.counterpartyAccount}
          value={record.counterpartyBankAccountId}
          onChange={(accountId) =>
            onCounterpartyBankAccountChange(index, accountId)
          }
          onAdd={() => onAddCounterpartyBankAccount(index, record)}
        />
      ),
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
      title: t("bank.fields.offsetAccount"),
      dataIndex: "offsetAccountId",
      width: 220,
      render: (_, record, index) => (
        <BankTransactionOffsetAccountSelect
          options={
            offsetAccountOptionsByDocumentType[
              getTransactionDocumentTypeId(record)
            ] ?? []
          }
          value={record.offsetAccountId}
          loading={chartAccountLoading}
          onChange={(accountId) => onOffsetAccountChange(index, accountId)}
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
      title: t("purchase.fields.contract"),
      dataIndex: "contractId",
      width: 220,
      render: (_, record, index) => (
        <BankTransactionContractSelect
          counterpartyId={record.counterpartyId}
          transactionDate={record.date}
          value={record.contractId}
          onChange={(contractId) => onContractChange(index, contractId)}
          onAdd={() => onAddContract(index, record)}
        />
      ),
    },
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
        hasBankAccount &&
          hasBankChartAccount &&
          !hasMissingCounterparty &&
          !hasMissingOffsetAccount &&
          !hasMissingContract &&
          !hasMissingCounterpartyBankAccount
          ? "border-border"
          : "border-danger/40 bg-danger-soft/40!",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          onClick={onToggle}
        >
          <span className="mt-1 text-secondary-text">
            {expanded ? (
              <ChevronDown className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-text">
              {item.title}
            </span>
            <span className="mt-1 flex flex-wrap gap-2 text-sm text-secondary-text">
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
              {!hasBankChartAccount && (
                <Tag color="red">{t("bank.messages.bankChartAccountMissing")}</Tag>
              )}
              {hasMissingOffsetAccount && (
                <Tag color="red">{t("bank.messages.offsetAccountMissing")}</Tag>
              )}
            {hasMissingContract && (
              <Tag color="red">{t("bank.messages.contractMissing")}</Tag>
            )}
            {hasMissingCounterpartyBankAccount && (
              <Tag color="red">{t("bank.messages.counterpartyAccountMissing")}</Tag>
            )}
              {item.accountNumber && <Tag>{item.accountNumber}</Tag>}
            </span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-surface-muted px-3 py-2">
            <div className="text-xs text-secondary-text">{t("bank.fields.date")}</div>
            <div className="font-semibold">
              {customDate(dateFrom)}
              {dateTo && dateTo !== dateFrom ? ` - ${customDate(dateTo)}` : ""}
            </div>
          </div>
          <div className="rounded-lg bg-surface-muted px-3 py-2 text-right">
            <div className="text-xs text-secondary-text">
              {t("bank.fields.currencyId")}
            </div>
            <div className="font-semibold">{item.currencyId ?? "-"}</div>
          </div>
          <div className="rounded-lg bg-surface-muted px-3 py-2 text-right">
            <div className="text-xs text-secondary-text">
              {t("bank.fields.operationType")}
            </div>
            <div className="font-semibold">{item.operationTypeId ?? "-"}</div>
          </div>
          <div className="rounded-lg bg-surface-muted px-3 py-2 text-right">
            <div className="text-xs text-secondary-text">
              {t("bank.fields.debit")}
            </div>
            <div className="font-semibold">{numberSpacing(totalDebit)}</div>
          </div>
          <div className="rounded-lg bg-surface-muted px-3 py-2 text-right">
            <div className="text-xs text-secondary-text">
              {t("bank.fields.credit")}
            </div>
            <div className="font-semibold">{numberSpacing(totalCredit)}</div>
          </div>
          <div className="rounded-lg bg-surface-muted px-3 py-2 text-right">
            <div className="text-xs text-secondary-text">
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
          <Select
            className="w-60"
            value={item.bankChartAccountId ?? undefined}
            placeholder={t("bank.placeholders.selectBankChartAccount")}
            loading={chartAccountLoading}
            options={bankAccountOptions.map((option) => ({
              value: option.id,
              label: chartAccountOptionLabel(option),
            }))}
            labelRender={(props) =>
              getSelectedLabel(props.value, bankAccountOptions) ?? props.label
            }
            showSearch
            allowClear
            onChange={(value) =>
              onBankChartAccountChange(value ? Number(value) : null)
            }
            onClear={() => onBankChartAccountChange(null)}
            disabled={chartAccountLoading}
          />
        </div>
      </div>

      <div
        className={clsx(
          "border-t border-border p-4",
          !expanded && "hidden",
        )}
      >
        <Table<BankStatementTransaction>
          rowKey={(_, index) => `${item.id}-${index ?? 0}`}
          columns={columns}
          dataSource={item.transactions}
          pagination={false}
          virtual={item.transactions.length > 50}
          scroll={{ x: "max-content", y: "calc(100vh - 200px)" }}
          rowClassName={(record) =>
            !record.counterpartyId ||
            !record.offsetAccountId ||
            !record.contractId ||
            !record.counterpartyBankAccountId
              ? "[&_.ant-table-cell]:!bg-danger-soft [&_.ant-table-cell]:!text-text hover:[&_.ant-table-cell]:!bg-danger-soft"
              : ""
          }
          locale={{ emptyText: t("bank.messages.noTransactions") }}
        />
      </div>
    </Card>
  );
}

export default memo(
  BankStatementCard,
  (previous, next) =>
    previous.item === next.item &&
    previous.expanded === next.expanded &&
    previous.chartAccountLoading === next.chartAccountLoading &&
    previous.bankAccountOptionsByDocumentType ===
      next.bankAccountOptionsByDocumentType &&
    previous.offsetAccountOptionsByDocumentType ===
      next.offsetAccountOptionsByDocumentType,
);
