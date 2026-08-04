import type { ReactNode } from "react";
import {
  Barcode,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Package,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import type { FaAsset } from "../types/type";
import useFaAssetLookups from "./useFaAssetLookups";

interface DetailItem {
  label: string;
  value: ReactNode;
}

interface DetailSectionProps {
  title: string;
  items: DetailItem[];
  columns?: string;
}

const joinValues = (...values: Array<string | number | null | undefined>) =>
  values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" — ") || "-";

function DetailSection({
  title,
  items,
  columns = "md:grid-cols-2 xl:grid-cols-3",
}: DetailSectionProps) {
  return (
    <Card className="border border-border p-4 sm:p-5">
      <div className="mb-3 text-base font-semibold text-heading">{title}</div>
      <div className={`grid gap-3 ${columns}`}>
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-surface-muted px-3 py-2.5"
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

interface FaAssetReadonlyViewProps {
  record: FaAsset;
  action?: ReactNode;
}

export default function FaAssetReadonlyView({
  record,
  action,
}: FaAssetReadonlyViewProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
  const lookups = useFaAssetLookups();

  return (
    <div className="min-w-0 space-y-2">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={record.organizationName || organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<Barcode size={24} strokeWidth={1.8} />}
          label={t("fa.fields.inventoryNumber")}
          value={record.inventoryNumber || `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<Package size={24} strokeWidth={1.8} />}
          label={t("fa.fields.sourceProductTable")}
          value={joinValues(
            record.sourceProductTableSerialNumber,
            record.sourceProductTableMarkingNumber,
          )}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("fa.fields.commissioningDate")}
          value={customDate(record.commissioningDate)}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("fa.fields.initialCost")}
          value={numberSpacing(record.initialCost ?? 0)}
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.name")}
            </div>
            <div className="mt-0.5 truncate text-base font-semibold text-heading">
              {record.name || "-"}
            </div>
          </div>
          <div className="min-w-40">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.state")}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-text">
              {record.stateName || record.stateId || "-"}
            </div>
          </div>
          <ProcessStatusBadge
            statusId={record.statusId}
            statusCode={record.statusCode}
            statusName={record.statusName}
          />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailSection
          title={t("fa.asset.classification")}
          columns="md:grid-cols-2"
          items={[
            {
              label: t("fa.fields.faGroup"),
              value: joinValues(record.faGroupCode, record.faGroupName),
            },
            {
              label: t("fa.fields.okof"),
              value: joinValues(record.okofCode, record.okofName),
            },
            {
              label: t("fa.fields.depreciationMethod"),
              value: joinValues(
                record.depreciationMethodCode,
                record.depreciationMethodName,
              ),
            },
            {
              label: t("fa.fields.usefulLifeMonths"),
              value: numberSpacing(record.usefulLifeMonths ?? 0),
            },
            {
              label: t("fa.fields.plannedUnitsTotal"),
              value: numberSpacing(record.plannedUnitsTotal ?? 0),
            },
          ]}
        />

        <DetailSection
          title={t("fa.asset.valuation")}
          columns="md:grid-cols-2"
          items={[
            {
              label: t("fa.fields.initialCost"),
              value: numberSpacing(record.initialCost ?? 0),
            },
            {
              label: t("fa.fields.salvageValue"),
              value: numberSpacing(record.salvageValue ?? 0),
            },
            {
              label: t("fa.fields.commissioningDate"),
              value: customDate(record.commissioningDate),
            },
            {
              label: t("fa.fields.deprStartDate"),
              value: customDate(record.deprStartDate),
            },
          ]}
        />
      </div>

      <DetailSection
        title={t("fa.asset.placement")}
        items={[
          {
            label: t("fa.fields.department"),
            value: record.departmentName || record.departmentId || "-",
          },
          {
            label: t("fa.fields.responsibleUser"),
            value:
              record.responsibleUserName || record.responsibleUserId || "-",
          },
          {
            label: t("fa.fields.sourceProductTable"),
            value: joinValues(
              record.sourceProductTableSerialNumber,
              record.sourceProductTableMarkingNumber,
            ),
          },
        ]}
      />

      <DetailSection
        title={t("fa.sections.accounts")}
        items={[
          {
            label: t("fa.fields.assetAccount"),
            value: lookups.accountLabel(record.assetAccountId),
          },
          {
            label: t("fa.fields.accumulatedDepreciationAccount"),
            value: lookups.accountLabel(
              record.accumulatedDepreciationAccountId,
            ),
          },
          {
            label: t("fa.fields.depreciationExpenseAccount"),
            value: lookups.accountLabel(record.depreciationExpenseAccountId),
          },
        ]}
      />

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}
