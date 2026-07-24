import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CalendarDays,
  Landmark,
  Scale,
} from "lucide-react";
import dayjs from "dayjs";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { formatDate, numberSpacing } from "@/utils/utils";
import type { OpeningBalance } from "../types/type";

interface OpeningBalanceDocumentHeaderProps {
  data: OpeningBalance;
  totalDebit: number;
  totalCredit: number;
  actions: ReactNode;
}

export default function OpeningBalanceDocumentHeader({
  data,
  totalDebit,
  totalCredit,
  actions,
}: OpeningBalanceDocumentHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <Card className="border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary">
              <Scale className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-heading">
                  {t("openingBalance.title")}
                </h1>
                {stateStatus(data.stateId, data.stateName)}
              </div>
              <p className="mt-0.5 text-sm text-secondary-text">
                {t("openingBalance.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </div>
      </Card>

      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={23} strokeWidth={1.8} />}
          label={t("settings.fields.organization")}
          value={data.organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={23} strokeWidth={1.8} />}
          label={t("openingBalance.fields.balanceDate")}
          value={
            data.balanceDate
              ? dayjs(data.balanceDate).format("DD.MM.YYYY")
              : "-"
          }
        />
        <DocumentSummaryItem
          icon={<Landmark size={23} strokeWidth={1.8} />}
          label={t("openingBalance.fields.accountsCount")}
          value={data.accounts?.length ?? 0}
        />
        <DocumentSummaryItem
          icon={<ArrowDownToLine size={23} strokeWidth={1.8} />}
          label={t("openingBalance.fields.totalDebit")}
          value={`${numberSpacing(totalDebit, undefined, true)} UZS`}
          emphasized
        />
        <DocumentSummaryItem
          icon={<ArrowUpFromLine size={23} strokeWidth={1.8} />}
          label={t("openingBalance.fields.totalCredit")}
          value={`${numberSpacing(totalCredit, undefined, true)} UZS`}
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <div className="text-xs text-secondary-text">
              {t("openingBalance.fields.description")}
            </div>
            <div className="mt-1 text-sm text-text">
              {data.description || "-"}
            </div>
          </div>
          <div className="md:min-w-48 md:border-l md:border-border md:pl-4">
            <div className="text-xs text-secondary-text">
              {t("settings.fields.createdDate")}
            </div>
            <div className="mt-1 text-sm font-medium text-text">
              {data.createdDate ? formatDate(data.createdDate) : "-"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
