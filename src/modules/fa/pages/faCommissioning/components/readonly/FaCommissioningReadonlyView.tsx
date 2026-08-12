import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  Boxes,
  Building2,
  CalendarDays,
  CircleCheckBig,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate } from "@/utils/utils";
import type { FaCommissioning } from "../../types/type";
import FaCommissioningAssetDetails from "./FaCommissioningAssetDetails";
import type { CommissioningReadonlyAsset } from "./types";
import useFaCommissioningLookups from "./useFaCommissioningLookups";

interface FaCommissioningReadonlyViewProps {
  record: FaCommissioning;
  action?: ReactNode;
}

export default function FaCommissioningReadonlyView({
  record,
  action,
}: FaCommissioningReadonlyViewProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
  const lookups = useFaCommissioningLookups();

  const assets = useMemo<CommissioningReadonlyAsset[]>(
    () =>
      (record.lines ?? []).map((line, index) => {
        const lookupAsset = lookups.assetLabel(line.faAssetId);
        const [lookupInventory = "", ...lookupNameParts] =
          lookupAsset.split(" — ");
        const hasStructuredAsset = lookupNameParts.length > 0;

        return {
          key: `${line.faAssetId}-${index}`,
          index: index + 1,
          inventoryNumber:
            line.faAssetInventoryNumber ||
            (hasStructuredAsset ? lookupInventory : "-") ||
            "-",
          assetName:
            line.faAssetName ||
            lookupNameParts.join(" — ") ||
            lookupAsset ||
            String(line.faAssetId),
          deprStartDate: line.deprStartDate,
          salvageValue: Number(line.salvageValue ?? 0),
          usefulLifeMonths: Number(line.usefulLifeMonths ?? 0),
          depreciationMethod:
            line.depreciationMethodName ||
            lookups.methodLabel(line.depreciationMethodId),
          plannedUnitsTotal: line.plannedUnitsTotal,
          department:
            line.departmentName || lookups.departmentLabel(line.departmentId),
          responsibleUser:
            line.responsibleUserName ||
            lookups.userLabel(line.responsibleUserId),
          accumulatedDepreciationAccount: lookups.accountLabel(
            line.accumulatedDepreciationAccountId,
          ),
          depreciationExpenseAccount: lookups.accountLabel(
            line.depreciationExpenseAccountId,
          ),
          note: line.note || "-",
        };
      }),
    [lookups, record.lines],
  );

  return (
    <div className="min-w-0 space-y-4">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={record.organizationName || organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentNumber")}
          value={record.documentNumber || record.docNumber || `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentDate")}
          value={customDate(record.documentDate || record.docDate)}
        />
        <DocumentSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label={t("fa.commissioning.assetCount")}
          value={String(assets.length)}
          emphasized
        />
        <DocumentSummaryItem
          icon={<CircleCheckBig size={24} strokeWidth={1.8} />}
          label={t("settings.fields.status")}
          value={
            <ProcessStatusBadge
              statusId={record.statusId}
              statusName={record.statusName}
            />
          }
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="text-xs text-secondary-text">
          {t("fa.fields.note")}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-text">
          {record.note || "-"}
        </div>
      </Card>

      <div className="min-w-0 space-y-4">
        {assets.length ? (
          assets.map((asset) => (
            <FaCommissioningAssetDetails key={asset.key} asset={asset} />
          ))
        ) : (
          <FaCommissioningAssetDetails />
        )}
      </div>

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}
