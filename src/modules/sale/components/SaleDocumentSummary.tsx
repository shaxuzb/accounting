import type { ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react";
import { customDate, numberSpacing } from "@/utils/utils";
import type { SaleDoc } from "../types/type";

interface SummaryItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  emphasized?: boolean;
}

const SummaryItem = ({ icon, label, value, emphasized }: SummaryItemProps) => (
  <div className="flex min-w-0 items-center gap-3 px-4 py-3 lg:border-r lg:border-border last:lg:border-r-0">
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
  document?: SaleDoc;
  organizationName: string;
  totalAmount: number;
}

export default function SaleDocumentSummary({
  document,
  organizationName,
  totalAmount,
}: Props) {
  const currency = document?.currencyName || "UZS";

  return (
    <section className="grid overflow-hidden rounded-lg border border-border bg-primary-bg shadow-sm sm:grid-cols-2 lg:grid-cols-5">
      <SummaryItem
        icon={<Building2 size={24} strokeWidth={1.8} />}
        label="Tashkilot"
        value={organizationName || "-"}
      />
      <SummaryItem
        icon={<FileText size={24} strokeWidth={1.8} />}
        label="Hujjat"
        value={document?.docNumber || `#${document?.id ?? "-"}`}
      />
      <SummaryItem
        icon={<CalendarDays size={24} strokeWidth={1.8} />}
        label="Hujjat sanasi"
        value={document?.docDate ? customDate(document.docDate) : "-"}
      />
      <SummaryItem
        icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
        label="Valyuta"
        value={currency}
      />
      <SummaryItem
        icon={<WalletCards size={24} strokeWidth={1.8} />}
        label="Hujjat summasi"
        value={`${numberSpacing(totalAmount, undefined, true)} ${currency}`}
        emphasized
      />
    </section>
  );
}
