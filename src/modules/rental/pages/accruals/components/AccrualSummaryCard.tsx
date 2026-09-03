import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import type { RentalAccrualDetail } from "../types/type";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { formatDate, numberSpacing } from "@/utils/utils";

interface AccrualSummaryCardProps {
  data: RentalAccrualDetail;
}

export default function AccrualSummaryCard({ data }: AccrualSummaryCardProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
  const currency = data.currencyCode || data.currencyId || "-";

  return (
    <DocumentSummary>
      <DocumentSummaryItem
        icon={<Building2 size={24} strokeWidth={1.8} />}
        label={t("app.fields.organization")}
        value={organizationName || "-"}
      />
      <DocumentSummaryItem
        icon={<FileText size={24} strokeWidth={1.8} />}
        label={t("rental.fields.docNumber")}
        value={data.docNumber || "-"}
      />
      <DocumentSummaryItem
        icon={<CalendarDays size={24} strokeWidth={1.8} />}
        label={t("rental.fields.docDate")}
        value={formatDate(data.docDate)}
      />
      <DocumentSummaryItem
        icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
        label={t("rental.fields.currency")}
        value={currency}
      />
      <DocumentSummaryItem
        icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
        label={t("rental.fields.amount")}
        value={`${numberSpacing(data.amount)} ${currency}`}
        emphasized
      />
    </DocumentSummary>
  );
}
