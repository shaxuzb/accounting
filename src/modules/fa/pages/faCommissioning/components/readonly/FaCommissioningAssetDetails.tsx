import type { ReactNode } from "react";
import { CalendarClock, Landmark, MapPin, PackageCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { customDate, numberSpacing } from "@/utils/utils";
import type { CommissioningReadonlyAsset } from "./types";

interface DetailItemProps {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

function DetailItem({ label, value, mono }: DetailItemProps) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface-muted/45 px-3 py-2.5">
      <div className="text-xs text-secondary-text">{label}</div>
      <div
        className={`mt-1 wrap-break-word text-sm font-semibold text-text ${
          mono ? "font-mono" : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}

interface DetailSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function DetailSection({ icon, title, children }: DetailSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        {icon}
        <span>{title}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">{children}</div>
    </section>
  );
}

interface FaCommissioningAssetDetailsProps {
  asset?: CommissioningReadonlyAsset;
}

export default function FaCommissioningAssetDetails({
  asset,
}: FaCommissioningAssetDetailsProps) {
  const { t } = useTranslation();

  if (!asset) {
    return (
      <Card className="flex min-h-96 items-center justify-center border border-border p-6 text-center text-sm text-secondary-text">
        {t("fa.commissioning.noAssets")}
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden border border-border">
      <div className="flex flex-wrap items-start gap-3 border-b border-border bg-primary/5 px-4 py-4 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          {asset.index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs font-semibold text-primary">
            {asset.inventoryNumber}
          </div>
          <div className="mt-1 text-lg font-semibold text-heading">
            {asset.assetName}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary-bg px-2.5 py-1.5 text-xs font-semibold text-primary">
          <PackageCheck className="size-4" />
          {t("fa.commissioning.lifecycleCommissioning")}
        </div>
      </div>

      <div className="space-y-2 p-4 ">
        <DetailSection
          icon={<CalendarClock className="size-4" />}
          title={t("fa.commissioning.amortizationDetails")}
        >
          <DetailItem
            label={t("fa.fields.deprStartDate")}
            value={customDate(asset.deprStartDate)}
          />
          <DetailItem
            label={t("fa.fields.depreciationMethod")}
            value={asset.depreciationMethod}
          />
          <DetailItem
            label={t("fa.fields.usefulLifeMonths")}
            value={numberSpacing(asset.usefulLifeMonths)}
          />
          <DetailItem
            label={t("fa.fields.salvageValue")}
            value={numberSpacing(asset.salvageValue)}
          />
          <DetailItem
            label={t("fa.fields.plannedUnitsTotal")}
            value={
              asset.plannedUnitsTotal == null
                ? "-"
                : numberSpacing(asset.plannedUnitsTotal)
            }
          />
        </DetailSection>

        <div className="border-t border-border" />

        <DetailSection
          icon={<MapPin className="size-4" />}
          title={t("fa.asset.placement")}
        >
          <DetailItem
            label={t("fa.fields.department")}
            value={asset.department}
          />
          <DetailItem
            label={t("fa.fields.responsibleUser")}
            value={asset.responsibleUser}
          />
        </DetailSection>

        <div className="border-t border-border" />

        <DetailSection
          icon={<Landmark className="size-4" />}
          title={t("fa.sections.accounts")}
        >
          <DetailItem
            label={t("fa.fields.accumulatedDepreciationAccount")}
            value={asset.accumulatedDepreciationAccount}
            mono
          />
          <DetailItem
            label={t("fa.fields.depreciationExpenseAccount")}
            value={asset.depreciationExpenseAccount}
            mono
          />
        </DetailSection>

        <div className="border-t border-border" />

        <div>
          <div className="text-xs text-secondary-text">
            {t("fa.fields.note")}
          </div>
          <div className="mt-1 text-sm text-text">{asset.note}</div>
        </div>
      </div>
    </Card>
  );
}
