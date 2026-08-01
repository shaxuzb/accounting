import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { customDate, numberSpacing } from "@/utils/utils";
import type { SaleDoc } from "../types/type";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const currency = document?.currencyCode || "UZS";

  return (
    <DocumentSummary>
      <DocumentSummaryItem
        icon={<Building2 size={24} strokeWidth={1.8} />}
        label={t("app.fields.organization")}
        value={organizationName || "-"}
      />
      <DocumentSummaryItem
        icon={<FileText size={24} strokeWidth={1.8} />}
        label={t("app.fields.document")}
        value={document?.docNumber || `#${document?.id ?? "-"}`}
      />
      <DocumentSummaryItem
        icon={<CalendarDays size={24} strokeWidth={1.8} />}
        label={t("sale.fields.documentDate")}
        value={document?.docDate ? customDate(document.docDate) : "-"}
      />
      <DocumentSummaryItem
        icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
        label={t("app.fields.currency")}
        value={currency}
      />
      <DocumentSummaryItem
        icon={<WalletCards size={24} strokeWidth={1.8} />}
        label={t("sale.fields.documentAmount")}
        value={`${numberSpacing(totalAmount, undefined, true)} ${currency}`}
        emphasized
      />
    </DocumentSummary>
  );
}
