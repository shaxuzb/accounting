import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { customDate } from "@/utils/utils";
import type { FaReceiptResponse } from "../../types/type";
import FaReceiptAssetsTable from "./FaReceiptAssetsTable";
import useFaReceiptLookups from "./useFaReceiptLookups";
import { formatReceiptAmount, getApiText } from "./faReceiptReadonlyUtils";

interface FaReceiptReadonlyViewProps {
  record: FaReceiptResponse;
  action?: ReactNode;
}

export default function FaReceiptReadonlyView({
  record,
  action,
}: FaReceiptReadonlyViewProps) {
  const { t } = useTranslation();
  const lookups = useFaReceiptLookups();
  const lines = record.lines ?? [];
  const totalAmount = lines.reduce(
    (total, line) =>
      total + Number(line.quantity || 0) * Number(line.price || 0),
    0,
  );
  const currency =
    getApiText(record, "currencyCode", "currencyName") ||
    lookups.label("currencies", record.currencyId, ["code", "name"]);
  const counterparty =
    getApiText(record, "counterpartyName", "supplierName") ||
    lookups.label("counterparties", record.counterpartyId, [
      "name",
      "fullName",
      "shortName",
      "inn",
    ]);
  const receiptType =
    getApiText(record, "receiptTypeName") ||
    lookups.label("receiptTypes", record.receiptTypeId);

  return (
    <div className="min-w-0 space-y-4">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("products.fields.supplier")}
          value={counterparty}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentNumber")}
          value={record.documentNumber || `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentDate")}
          value={customDate(record.docDate || record.documentDate)}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("fa.fields.currencyId")}
          value={currency}
        />
        <DocumentSummaryItem
          icon={<WalletCards size={24} strokeWidth={1.8} />}
          label={t("fa.sections.documentTotal")}
          value={`${formatReceiptAmount(totalAmount)} ${currency}`}
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div className="min-w-48">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.receiptType")}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-text">
              {receiptType}
            </div>
          </div>
          <ProcessStatusBadge
            statusId={record.statusId}
            statusName={record.statusName}
          />
        </div>
      </Card>

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="border-b border-border px-4 py-3 text-base font-semibold text-heading">
          {t("fa.sections.documentLines")}
        </div>

        <div className="divide-y divide-border">
          {lines.map((line, lineIndex) => {
            const lineTotal =
              Number(line.quantity || 0) * Number(line.price || 0);
            const vatRate =
              getApiText(line, "vatRateName") ||
              lookups.label("vatRates", line.vatRateId);

            return (
              <section
                key={`${line.name}-${lineIndex}`}
                className="min-w-0"
              >
                <div className="border-b border-border bg-brand-soft/45 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                        {lineIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-primary">
                          {line.name}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-7 gap-y-2 text-right sm:grid-cols-4">
                      <div>
                        <div className="text-[11px] text-secondary-text">
                          {t("fa.fields.quantity")}
                        </div>
                        <div className="text-sm font-semibold tabular-nums">
                          {formatReceiptAmount(line.quantity)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-secondary-text">
                          {t("purchase.fields.unitPrice")}
                        </div>
                        <div className="text-sm font-semibold tabular-nums">
                          {formatReceiptAmount(line.price)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-secondary-text">
                          {t("fa.fields.vatRateId")}
                        </div>
                        <div className="text-sm font-semibold">{vatRate}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-secondary-text">
                          {t("fa.sections.lineTotal")}
                        </div>
                        <div className="text-sm font-bold text-primary">
                          {formatReceiptAmount(lineTotal)} {currency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <FaReceiptAssetsTable
                  assets={line.assets ?? []}
                  currency={currency}
                  lineIndex={lineIndex}
                  label={lookups.label}
                  accountLabel={lookups.accountLabel}
                />

                <div className="grid gap-3 border-t border-border bg-surface-muted/35 px-4 py-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-secondary-text">
                      {t("fa.fields.capitalInvestmentAccount")}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-text">
                      {lookups.accountLabel(line.capitalInvestmentAccountId)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary-text">
                      {t("fa.fields.vatAccount")}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-text">
                      {lookups.accountLabel(line.vatAccountId)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-secondary-text">
                      {t("fa.fields.supplierAccount")}
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-text">
                      {lookups.accountLabel(record.supplierAccountId)}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </Card>

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}
