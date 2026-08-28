import type { ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { customDate, numberSpacing } from "@/utils/utils";
import type { BankOperationData } from "../pages/statement/types/type";

interface BankReadonlyDetailsCardProps {
  record: BankOperationData;
}

interface DetailItem {
  label: string;
  value: ReactNode;
  className?: string;
}

interface DetailSectionProps {
  title: string;
  items: DetailItem[];
  columns?: string;
}

const getOperationType = (
  record: BankOperationData,
  incomeLabel: string,
  expenseLabel: string,
) =>
  record.direction ??
  (record.directionId === 1
    ? incomeLabel
    : record.directionId === -1
      ? expenseLabel
      : record.operationTypeName);

function DetailSection({
  title,
  items,
  columns = "md:grid-cols-2 xl:grid-cols-4",
}: DetailSectionProps) {
  return (
    <Card className="border border-border p-4 sm:p-5">
      <div className="mb-3 text-base font-semibold text-heading">{title}</div>
      <div className={`grid gap-3 ${columns}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className={`min-w-0 rounded-lg border border-border bg-surface-muted px-3 py-2.5 ${item.className ?? ""}`}
          >
            <div className="text-xs text-secondary-text">{item.label}</div>
            <div className="mt-1  text-sm font-semibold text-text">
              {item.value ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function BankReadonlyDetailsCard({
  record,
}: BankReadonlyDetailsCardProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
  const operationType = getOperationType(
    record,
    t("bank.operation.income"),
    t("bank.operation.expense"),
  );
  const amount =
    `${numberSpacing(record.amount)} ${record.currencyName ?? ""}`.trim();

  return (
    <div className="min-w-0 space-y-2">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("purchase.fields.docNumber")}
          value={record.docNumber ?? `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("bank.fields.date")}
          value={customDate(record.docDate)}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("settings.fields.currency")}
          value={record.currencyName ?? "-"}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("bank.fields.amount")}
          value={amount || "-"}
          emphasized
        />
      </DocumentSummary>

      <DetailSection
        title={t("bank.readonlySections.general")}
        columns="md:grid-cols-2 xl:grid-cols-5"
        items={[
          { label: t("bank.fields.operationType"), value: operationType },
          {
            label: t("bank.fields.bankDocumentNumber"),
            value: record.bankDocumentNumber,
          },
          { label: t("bank.fields.exchangeRate"), value: record.exchangeRate },
          {
            label: t("bank.fields.classification"),
            value: record.classificationName ?? record.classificationCode,
          },
          {
            label: t("bank.fields.bankAccount"),
            value: record.bankAccountName,
          },
          {
            label: t("bank.fields.bankChartAccount"),
            value: record.bankChartAccountNumber,
          },
          {
            label: t("bank.fields.offsetAccount"),
            value: record.offsetAccountNumber,
          },
          {
            label: t("bank.fields.counterparty"),
            value: record.counterpartyName,
          },
          {
            label: t("bank.fields.counterpartyBankAccount"),
            value:
              record.counterpartyBankAccountName ??
              record.counterpartyBankAccountNumber,
          },
          {
            label: t("bank.fields.contract"),
            value: record.contractName ?? record.contractNumber,
          },
        ]}
      />

      {/* <DetailSection
        title={t("bank.readonlySections.bank")}
        columns="md:grid-cols-2 xl:grid-cols-3"
        items={[
          {
            label: t("bank.fields.bankAccount"),
            value: record.bankAccountName,
          },
          {
            label: t("bank.fields.bankChartAccount"),
            value: record.bankChartAccountNumber,
          },
          {
            label: t("bank.fields.offsetAccount"),
            value: record.offsetAccountNumber,
          },
        ]}
      /> */}

      {/* <DetailSection
        title={t("bank.readonlySections.counterparty")}
        columns="md:grid-cols-2 xl:grid-cols-3"
        items={[
          {
            label: t("bank.fields.counterparty"),
            value: record.counterpartyName,
          },
          {
            label: t("bank.fields.counterpartyBankAccount"),
            value:
              record.counterpartyBankAccountName ??
              record.counterpartyBankAccountNumber,
          },
          {
            label: t("bank.fields.contract"),
            value: record.contractName ?? record.contractNumber,
          },
        ]}
      /> */}

      <DetailSection
        title={t("bank.readonlySections.comment")}
        items={[
          {
            label: t("bank.fields.comment"),
            value: record.comment,
            className: "md:col-span-2 xl:col-span-4",
          },
        ]}
      />
    </div>
  );
}
