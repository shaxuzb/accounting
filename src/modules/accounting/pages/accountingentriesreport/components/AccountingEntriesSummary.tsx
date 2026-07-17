import type { ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react";
import { customDate, numberSpacing } from "@/utils/utils";
import type { AccountingEntriesReport } from "../types/type";
import { useTranslation } from "react-i18next";

interface SummaryItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  emphasized?: boolean;
}

const SummaryItem = ({ icon, label, value, emphasized }: SummaryItemProps) => (
  <div className="flex min-h-20 min-w-0 items-center gap-3 border-b border-border px-5 py-3 lg:border-r lg:border-b-0 last:border-r-0 last:border-b-0">
    <div className="shrink-0 text-primary">{icon}</div>
    <div className="min-w-0">
      <div className="text-xs text-secondary-text">{label}</div>
      <div
        className={`mt-0.5 truncate text-sm font-semibold ${
          emphasized ? "text-primary" : "text-text"
        }`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </div>
    </div>
  </div>
);

interface Props {
  data: AccountingEntriesReport;
  organizationName: string;
}

export default function AccountingEntriesSummary({
  data,
  organizationName,
}: Props) {
  const { t } = useTranslation();
  const currency = data.currency || "-";

  return (
    <section className="grid overflow-hidden rounded-lg border border-border bg-primary-bg shadow-sm sm:grid-cols-2 lg:grid-cols-5">
      <SummaryItem
        icon={<Building2 size={24} strokeWidth={1.8} />}
        label={t("app.fields.organization")}
        value={organizationName || "-"}
      />
      <SummaryItem
        icon={<FileText size={24} strokeWidth={1.8} />}
        label={t("app.fields.document")}
        value={data.documentNumber || "-"}
      />
      <SummaryItem
        icon={<CalendarDays size={24} strokeWidth={1.8} />}
        label={t("app.fields.postingDate")}
        value={data.date ? customDate(data.date) : "-"}
      />
      <SummaryItem
        icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
        label={t("app.fields.currency")}
        value={currency}
      />
      <SummaryItem
        icon={<WalletCards size={24} strokeWidth={1.8} />}
        label={t("app.fields.documentAmount")}
        value={`${numberSpacing(data.totalAmount, undefined, true)} ${currency}`}
        emphasized
      />
    </section>
  );
}
