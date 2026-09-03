import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import SectionCard from "@/components/ui/card/SectionCard";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ReadonlyFieldGrid, {
  type ReadonlyFieldItem,
} from "@/components/ui/card/ReadonlyFieldGrid";
import { customDate, numberSpacing } from "@/utils/utils";

export interface CashReadonlyRecord {
  id: number;
  docNumber?: string | null;
  docDate: string;
  currencyName?: string | null;
  amount: number;
  comment?: string | null;
}

export type CashReadonlyDetailItem = ReadonlyFieldItem;

interface CashReadonlyLayoutProps {
  record: CashReadonlyRecord;
  items: CashReadonlyDetailItem[];
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

      <SectionCard
        title={t("bank.readonlySections.general")}
        bodyClassName="p-4 sm:p-5"
      >
        <ReadonlyFieldGrid items={items} columns="md:grid-cols-2 xl:grid-cols-6" />
      </SectionCard>

      <SectionCard
        title={t("bank.readonlySections.comment")}
        bodyClassName="p-4 sm:p-5"
      >
        <ReadonlyFieldGrid
          items={[
            {
              label: t("cash.fields.comment"),
              value: record.comment,
              className: "md:col-span-2 xl:col-span-4",
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}
