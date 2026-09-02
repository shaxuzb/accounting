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

export interface CashReadonlyRecord {
  id: number;
  docNumber?: string | null;
  docDate: string;
  currencyName?: string | null;
  amount: number;
  comment?: string | null;
}

export interface CashReadonlyDetailItem {
  label: string;
  value: ReactNode;
  className?: string;
}

interface CashReadonlyLayoutProps {
  record: CashReadonlyRecord;
  items: CashReadonlyDetailItem[];
}

function DetailSection({
  title,
  items,
  columns = "md:grid-cols-2 xl:grid-cols-4",
}: {
  title: string;
  items: CashReadonlyDetailItem[];
  columns?: string;
}) {
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
            <div className="mt-1 text-sm font-semibold text-text">
              {item.value ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function CashReadonlyLayout({
  record,
  items,
}: CashReadonlyLayoutProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
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
          label={t("cash.fields.documentNumber")}
          value={record.docNumber ?? `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("cash.fields.date")}
          value={customDate(record.docDate)}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("cash.fields.currency")}
          value={record.currencyName ?? "-"}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("cash.fields.amount")}
          value={amount || "-"}
          emphasized
        />
      </DocumentSummary>

      <DetailSection
        title={t("bank.readonlySections.general")}
        columns="md:grid-cols-2 xl:grid-cols-6"
        items={items}
      />

      <DetailSection
        title={t("bank.readonlySections.comment")}
        items={[
          {
            label: t("cash.fields.comment"),
            value: record.comment,
            className: "md:col-span-2 xl:col-span-4",
          },
        ]}
      />
    </div>
  );
}
